import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSubscribers, exportSubscribers } from "../api";
import { 
  EnvelopeIcon, 
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function AdminSubscribers() {
  const [showActive, setShowActive] = useState(true);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-subscribers", showActive],
    queryFn: () => getSubscribers({ active: showActive }),
  });

  const subscribers = data?.data?.data?.subscribers || [];
  const stats = data?.data?.data?.stats || { total: 0, active: 0, inactive: 0 };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleExport = async () => {
    try {
      const response = await exportSubscribers();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Subscribers exported!');
    } catch (err) {
      toast.error('Failed to export subscribers');
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Newsletter Subscribers</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your email subscriber list.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EnvelopeIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Subscribers
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active
                  </dt>
                  <dd className="text-lg font-semibold text-green-600">{stats.active}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Unsubscribed
                  </dt>
                  <dd className="text-lg font-semibold text-red-600">{stats.inactive}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setShowActive(true)}
          className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
            showActive
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setShowActive(false)}
          className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
            !showActive
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Unsubscribed
        </button>
      </div>

      {isLoading ? (
        <div className="mt-8 text-center text-gray-500">Loading...</div>
      ) : error ? (
        <div className="mt-8 text-center text-red-500">Failed to load subscribers</div>
      ) : subscribers.length === 0 ? (
        <div className="mt-8 text-center text-gray-500">
          No {showActive ? "active" : "unsubscribed"} subscribers yet.
        </div>
      ) : (
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                        Email
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Subscribed Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {subscribers.map((subscriber) => (
                      <tr key={subscriber._id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                          <div className="flex items-center gap-2">
                            <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {subscriber.email}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                              subscriber.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {subscriber.isActive ? (
                              <>
                                <CheckCircleIcon className="h-3 w-3" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="h-3 w-3" />
                                Unsubscribed
                              </>
                            )}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatDate(subscriber.subscribedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
