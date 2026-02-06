import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSubscribers, exportSubscribers } from "../api";
import { 
  EnvelopeIcon, 
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  PaperAirplaneIcon,
  PencilSquareIcon,
  XMarkIcon,
  SparklesIcon,
  UserGroupIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { useDarkModeStore } from "../stores/darkModeStore";

const newsletterTemplates = [
  {
    id: "new-products",
    name: "New Products",
    subject: "New Hair Growth Products Just Arrived! - MinoxidilKe",
    content: `Hi there,

We're excited to announce new products in our store!

Check out our latest arrivals:
• [Product 1]
• [Product 2]
• [Product 3]

Shop now and enjoy free delivery on orders over Ksh 6,000!

Visit: https://minoxidilke.com

Best regards,
MinoxidilKe Team`
  },
  {
    id: "sale",
    name: "Special Sale",
    subject: "Special Offer Just for You! - MinoxidilKe",
    content: `Hi there,

We have a special offer just for our subscribers!

Get [X]% OFF on all products this week only!

Use code: [DISCOUNT_CODE] at checkout.

Don't miss out - offer ends [DATE].

Shop now: https://minoxidilke.com

Best regards,
MinoxidilKe Team`
  },
  {
    id: "tips",
    name: "Hair Care Tips",
    subject: "Hair Growth Tips from MinoxidilKe",
    content: `Hi there,

Here are some tips to maximize your hair growth journey:

1. Apply minoxidil consistently twice daily
2. Use a derma roller once a week
3. Take biotin supplements for stronger hair
4. Massage your scalp for better blood circulation
5. Stay patient - results take 3-6 months

Need help choosing the right products? Reply to this email!

Best regards,
MinoxidilKe Team`
  },
  {
    id: "custom",
    name: "Custom",
    subject: "",
    content: ""
  }
];

export default function AdminSubscribers() {
  const { isDarkMode } = useDarkModeStore();
  const [showActive, setShowActive] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(newsletterTemplates[0]);
  const [subject, setSubject] = useState(newsletterTemplates[0].subject);
  const [content, setContent] = useState(newsletterTemplates[0].content);

  const { data, isLoading, error, refetch } = useQuery({
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

  const handleTemplateChange = (template) => {
    setSelectedTemplate(template);
    setSubject(template.subject);
    setContent(template.content);
  };

  const sendNewsletter = () => {
    if (!subject.trim() || !content.trim()) {
      toast.error("Please fill in both subject and content");
      return;
    }

    // Get all active subscriber emails
    const activeEmails = subscribers
      .filter(s => s.isActive)
      .map(s => s.email);

    if (activeEmails.length === 0) {
      toast.error("No active subscribers to send to");
      return;
    }

    // Open Gmail with BCC (for privacy) containing all subscribers
    const bcc = activeEmails.join(',');
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(content);
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&bcc=${bcc}&su=${encodedSubject}&body=${encodedBody}`;
    window.open(gmailUrl, "_blank");
    
    toast.success(`Opening Gmail with ${activeEmails.length} subscribers`);
    setShowComposer(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold flex items-center gap-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              <div className={`p-2 rounded-xl ${isDarkMode ? "bg-purple-600/20" : "bg-gradient-to-br from-purple-100 to-indigo-100"}`}>
                <EnvelopeIcon className={`h-6 w-6 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`} />
              </div>
              Newsletter Subscribers
            </h1>
            <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Manage your email subscriber list and send newsletters
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowComposer(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <PencilSquareIcon className="h-5 w-5" />
              Compose Newsletter
            </button>
            <button
              onClick={handleExport}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors border shadow-sm ${isDarkMode ? "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl">
              <UserGroupIcon className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Subscribers</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircleIcon className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-green-700">{stats.active}</div>
              <div className="text-sm text-green-600">Active Subscribers</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 border border-red-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <XCircleIcon className="h-7 w-7 text-red-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-red-700">{stats.inactive}</div>
              <div className="text-sm text-red-600">Unsubscribed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 p-4 border-b border-gray-100">
          <button
            onClick={() => setShowActive(true)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              showActive
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent"
            }`}
          >
            <CheckCircleIcon className="h-4 w-4" />
            Active ({stats.active})
          </button>
          <button
            onClick={() => setShowActive(false)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              !showActive
                ? "bg-red-100 text-red-700 border border-red-200"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent"
            }`}
          >
            <XCircleIcon className="h-4 w-4" />
            Unsubscribed ({stats.inactive})
          </button>
        </div>

        {/* Subscribers List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-red-600 mb-2">Failed to load subscribers</div>
            <button 
              onClick={() => refetch()}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              Try again
            </button>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <EnvelopeIcon className="h-10 w-10 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No subscribers yet</h3>
            <p className="text-gray-500">
              {showActive 
                ? "Active subscribers will appear here" 
                : "Unsubscribed users will appear here"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {subscribers.map((subscriber, index) => (
              <div
                key={subscriber._id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    subscriber.isActive 
                      ? "bg-gradient-to-br from-purple-500 to-indigo-500 text-white" 
                      : "bg-gray-200 text-gray-500"
                  }`}>
                    {subscriber.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{subscriber.email}</div>
                    <div className="text-sm text-gray-500">
                      Subscribed {formatDate(subscriber.subscribedAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    subscriber.isActive
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-red-100 text-red-700 border border-red-200"
                  }`}>
                    {subscriber.isActive ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Active
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Unsubscribed
                      </>
                    )}
                  </span>
                  {subscriber.isActive && (
                    <a
                      href={`mailto:${subscriber.email}`}
                      className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                      title="Send email"
                    >
                      <EnvelopeIcon className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Newsletter Composer Modal */}
      {showComposer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <PencilSquareIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Compose Newsletter</h3>
                  <p className="text-sm text-gray-500">
                    Send to {stats.active} active subscriber{stats.active !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowComposer(false)}
                className="p-2 rounded-lg hover:bg-white/70 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Templates */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <SparklesIcon className="h-4 w-4 inline mr-1 text-purple-500" />
                  Quick Templates
                </label>
                <div className="flex flex-wrap gap-2">
                  {newsletterTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateChange(template)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedTemplate.id === template.id
                          ? "bg-purple-100 text-purple-700 border border-purple-200"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  placeholder="Write your newsletter content here..."
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none font-mono text-sm"
                />
              </div>

              {/* Preview Info */}
              <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-3">
                  <ChartBarIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-blue-700 font-medium">How this works:</p>
                    <p className="text-blue-600 mt-1">
                      Clicking "Send Newsletter" will open Gmail in a new tab with all {stats.active} subscriber emails in BCC (hidden from each other for privacy), 
                      your subject line, and content pre-filled. You can review and make final edits before sending.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Recipients: <span className="text-gray-900 font-medium">{stats.active} subscribers</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowComposer(false)}
                    className="px-5 py-2.5 rounded-xl bg-white text-gray-700 font-medium hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendNewsletter}
                    disabled={stats.active === 0}
                    className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg ${
                      stats.active === 0
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl"
                    }`}
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                    Send Newsletter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
