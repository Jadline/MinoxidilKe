import PageNav from "../Components/PageNav";
import Footer from "../Components/Footer";

export default function TermsAndConditions() {
  return (
    <div className="bg-white">
      <PageNav />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Terms and Conditions
        </h1>
        <p className="mt-4 text-sm text-gray-500">Last updated: February 2026</p>

        <div className="mt-10 space-y-8 text-gray-600">
          <section>
            <h2 className="text-xl font-semibold text-gray-900">1. Introduction</h2>
            <p className="mt-3">
              Welcome to MinoxidilKe. By accessing and using our website and services, you agree to be bound 
              by these Terms and Conditions. Please read them carefully before making any purchase.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">2. Products and Services</h2>
            <p className="mt-3">
              MinoxidilKe offers hair regrowth products including minoxidil solutions, foams, and related 
              accessories. All products are genuine and sourced from authorized distributors.
            </p>
            <ul className="mt-3 list-disc pl-6 space-y-2">
              <li>Product images are for illustration purposes and may vary slightly from actual products.</li>
              <li>We reserve the right to limit quantities purchased per customer.</li>
              <li>Prices are subject to change without prior notice.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">3. Ordering and Payment</h2>
            <p className="mt-3">
              By placing an order, you warrant that you are at least 18 years old and legally capable of 
              entering into binding contracts.
            </p>
            <ul className="mt-3 list-disc pl-6 space-y-2">
              <li>All orders are subject to acceptance and availability.</li>
              <li>We accept M-Pesa and Pay on Delivery payment methods.</li>
              <li>Payment must be completed before order processing for M-Pesa orders.</li>
              <li>For Pay on Delivery, payment is due upon receipt of goods.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">4. Shipping and Delivery</h2>
            <p className="mt-3">
              We deliver to locations within Kenya, Uganda, and Tanzania. Delivery times may vary based 
              on your location and the shipping method selected.
            </p>
            <ul className="mt-3 list-disc pl-6 space-y-2">
              <li>Free delivery is available on orders over Ksh 6,000 within select areas.</li>
              <li>Delivery times are estimates and not guaranteed.</li>
              <li>Risk of loss passes to you upon delivery.</li>
              <li>You must provide accurate delivery information.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">5. Returns and Refunds</h2>
            <p className="mt-3">
              We want you to be satisfied with your purchase. If you have any issues:
            </p>
            <ul className="mt-3 list-disc pl-6 space-y-2">
              <li>Contact us within 7 days of receiving your order for any defective or incorrect items.</li>
              <li>Products must be unopened and in original packaging for returns.</li>
              <li>Refunds will be processed within 7-14 business days.</li>
              <li>Shipping costs for returns are the customer's responsibility unless the item was defective.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">6. Product Usage and Disclaimer</h2>
            <p className="mt-3">
              Minoxidil products are for external use only. Please read all product labels and instructions 
              before use.
            </p>
            <ul className="mt-3 list-disc pl-6 space-y-2">
              <li>Results may vary from person to person.</li>
              <li>Discontinue use if irritation occurs and consult a healthcare professional.</li>
              <li>Keep out of reach of children.</li>
              <li>Not intended for use by women unless specified on the product label.</li>
              <li>Consult a doctor before use if you have heart conditions or are on medication.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">7. Privacy Policy</h2>
            <p className="mt-3">
              Your privacy is important to us. We collect and use your personal information solely for 
              processing orders and improving our services. We do not sell or share your information with 
              third parties except as necessary for order fulfillment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">8. Intellectual Property</h2>
            <p className="mt-3">
              All content on this website, including text, graphics, logos, and images, is the property of 
              MinoxidilKe and is protected by copyright laws. Unauthorized use is prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">9. Limitation of Liability</h2>
            <p className="mt-3">
              MinoxidilKe shall not be liable for any indirect, incidental, special, or consequential damages 
              arising from the use of our products or services. Our liability is limited to the purchase price 
              of the products.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">10. Contact Information</h2>
            <p className="mt-3">
              If you have any questions about these Terms and Conditions, please contact us:
            </p>
            <ul className="mt-3 list-disc pl-6 space-y-2">
              <li>WhatsApp: +254 726 787 330</li>
              <li>Email: support@minoxidilke.com</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">11. Changes to Terms</h2>
            <p className="mt-3">
              We reserve the right to modify these Terms and Conditions at any time. Changes will be effective 
              immediately upon posting on the website. Your continued use of our services constitutes acceptance 
              of the modified terms.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
