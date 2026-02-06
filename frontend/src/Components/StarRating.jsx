import { StarIcon } from "@heroicons/react/20/solid";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";

const MAX_STARS = 5;

/**
 * Star rating: display only or interactive (click to set 1–5).
 * @param {number} rating - Current rating (0–5). For display can be decimal; for interactive use integer.
 * @param {function} [onChange] - If provided, component is interactive; called with 1–5 on click.
 * @param {string} [size] - 'sm' | 'md' | 'lg' (default 'md').
 * @param {number} [reviewCount] - Number of reviews. If 0 and not interactive, shows "New" badge.
 * @param {boolean} [showLabel] - Whether to show "New" or review count label.
 */
export default function StarRating({ rating = 0, onChange, size = "md", reviewCount, showLabel = false }) {
  const isInteractive = typeof onChange === "function";
  const value = Math.min(MAX_STARS, Math.max(0, Number(rating) || 0));
  const fullStars = Math.floor(value);
  const hasHalf = value % 1 >= 0.25 && value % 1 < 0.75;
  const hasNoReviews = reviewCount === 0 || (reviewCount === undefined && value === 0);

  const sizeClasses = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" };
  const iconClass = sizeClasses[size] || sizeClasses.md;

  // If no reviews and not interactive, show "New" badge
  if (hasNoReviews && !isInteractive && showLabel) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
          New
        </span>
      </div>
    );
  }

  const handleClick = (star) => {
    if (isInteractive && star >= 1 && star <= MAX_STARS) onChange(star);
  };

  return (
    <div
      className="flex items-center gap-0.5"
      role={isInteractive ? "group" : "img"}
      aria-label={`${value} out of ${MAX_STARS} stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= fullStars || (hasHalf && star === fullStars + 1);
        const showHalf = hasHalf && star === fullStars + 1;
        const starProps = {
          className: `${iconClass} shrink-0 ${
            filled ? "text-amber-400" : showHalf ? "text-amber-400" : "text-gray-300"
          } ${isInteractive ? "cursor-pointer hover:opacity-90" : ""}`,
          "aria-hidden": true,
        };
        if (isInteractive) {
          starProps.onClick = () => handleClick(star);
          starProps.onKeyDown = (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClick(star);
            }
          };
          starProps.tabIndex = 0;
          starProps.role = "button";
        }

        if (showHalf) {
          return (
            <span key={star} className="relative inline-block">
              <StarIconOutline className={`${iconClass} shrink-0 text-gray-300`} aria-hidden />
              <span
                className="absolute left-0 top-0 overflow-hidden"
                style={{ width: "50%" }}
              >
                <StarIcon className={`${iconClass} shrink-0 text-amber-400`} aria-hidden />
              </span>
            </span>
          );
        }

        return filled ? (
          <StarIcon key={star} {...starProps} />
        ) : (
          <StarIconOutline key={star} {...starProps} />
        );
      })}
      {showLabel && reviewCount !== undefined && reviewCount > 0 && (
        <span className="ml-1.5 text-sm text-gray-500">
          ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
        </span>
      )}
      {showLabel && hasNoReviews && !isInteractive && (
        <span className="ml-1.5 text-sm text-gray-400">
          No reviews yet
        </span>
      )}
    </div>
  );
}
