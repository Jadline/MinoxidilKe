import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContacts, updateContactStatus, deleteContact } from "../api";
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  TrashIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  InboxIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { useDarkModeStore } from "../stores/darkModeStore";

const statusConfig = {
  new: { 
    color: "bg-blue-100 text-blue-700 border-blue-200",
    dotColor: "bg-blue-500",
    label: "New"
  },
  read: { 
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    dotColor: "bg-yellow-500",
    label: "Read"
  },
  replied: { 
    color: "bg-green-100 text-green-700 border-green-200",
    dotColor: "bg-green-500",
    label: "Replied"
  },
  archived: { 
    color: "bg-gray-100 text-gray-600 border-gray-200",
    dotColor: "bg-gray-400",
    label: "Archived"
  },
};

export default function AdminContacts() {
  const queryClient = useQueryClient();
  const { isDarkMode } = useDarkModeStore();
  const [filter, setFilter] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-contacts", filter],
    queryFn: () => getContacts({ status: filter || undefined }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => updateContactStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-contacts"]);
      toast.success("Status updated");
      if (selectedContact) {
        setSelectedContact(prev => ({ ...prev, status: updateStatusMutation.variables?.status }));
      }
    },
    onError: () => toast.error("Failed to update status"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-contacts"]);
      toast.success("Contact deleted");
      setSelectedContact(null);
    },
    onError: () => toast.error("Failed to delete contact"),
  });

  const contacts = data?.data?.data?.contacts || [];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return d.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  const openGmailReply = (contact) => {
    const subject = encodeURIComponent(`Re: Your inquiry about ${contact.product} - MinoxidilKe`);
    const body = encodeURIComponent(
      `Hi ${contact.firstName},\n\nThank you for reaching out to us about ${contact.product}.\n\n[Your reply here]\n\nBest regards,\nMinoxidilKe Team`
    );
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${contact.email}&su=${subject}&body=${body}`;
    window.open(gmailUrl, "_blank");
    
    // Mark as replied after opening Gmail
    if (contact.status !== "replied") {
      updateStatusMutation.mutate({ id: contact._id, status: "replied" });
    }
  };

  const stats = {
    total: contacts.length,
    new: contacts.filter(c => c.status === "new").length,
    read: contacts.filter(c => c.status === "read").length,
    replied: contacts.filter(c => c.status === "replied").length,
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold flex items-center gap-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              <div className={`p-2 rounded-xl ${isDarkMode ? "bg-indigo-600/20" : "bg-gradient-to-br from-indigo-100 to-purple-100"}`}>
                <ChatBubbleLeftRightIcon className={`h-6 w-6 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} />
              </div>
              Contact Submissions
            </h1>
            <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              View and respond to customer inquiries
            </p>
          </div>
          
          {/* Stats */}
          <div className="flex gap-3">
            <div className={`rounded-xl px-4 py-2 border shadow-sm ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{stats.total}</div>
              <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Total</div>
            </div>
            <div className={`rounded-xl px-4 py-2 border ${isDarkMode ? "bg-blue-900/30 border-blue-700" : "bg-blue-50 border-blue-200"}`}>
              <div className="text-2xl font-bold text-blue-500">{stats.new}</div>
              <div className="text-xs text-blue-500">New</div>
            </div>
            <div className={`rounded-xl px-4 py-2 border ${isDarkMode ? "bg-green-900/30 border-green-700" : "bg-green-50 border-green-200"}`}>
              <div className="text-2xl font-bold text-green-500">{stats.replied}</div>
              <div className="text-xs text-green-500">Replied</div>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-6 flex flex-wrap gap-2">
          {[
            { value: "", label: "All", count: stats.total },
            { value: "new", label: "New", count: stats.new },
            { value: "read", label: "Read", count: stats.read },
            { value: "replied", label: "Replied", count: stats.replied },
            { value: "archived", label: "Archived", count: null },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === item.value
                  ? "bg-indigo-600 text-white shadow-lg"
                  : isDarkMode 
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {item.label}
              {item.count !== null && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  filter === item.value
                    ? "bg-white/20 text-white"
                    : isDarkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-600"
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className={`rounded-2xl shadow-sm border overflow-hidden ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-red-600 mb-2">Failed to load contacts</div>
            <button 
              onClick={() => queryClient.invalidateQueries(["admin-contacts"])}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              Try again
            </button>
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-20">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? "bg-indigo-900/30" : "bg-gradient-to-br from-indigo-100 to-purple-100"}`}>
              <InboxIcon className={`h-10 w-10 ${isDarkMode ? "text-indigo-400" : "text-indigo-500"}`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>No messages yet</h3>
            <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
              {filter ? `No ${filter} messages found` : "Contact submissions will appear here"}
            </p>
          </div>
        ) : (
          <div className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-100"}`}>
            {contacts.map((contact) => (
              <div
                key={contact._id}
                onClick={() => {
                  setSelectedContact(contact);
                  if (contact.status === "new") {
                    updateStatusMutation.mutate({ id: contact._id, status: "read" });
                  }
                }}
                className={`transition-all cursor-pointer ${
                  isDarkMode 
                    ? contact.status === "new" ? "bg-blue-900/20 hover:bg-gray-700/50" : "hover:bg-gray-700/50"
                    : contact.status === "new" ? "bg-blue-50/50 hover:bg-gray-50" : "hover:bg-gray-50"
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold ${
                        contact.status === "new" 
                          ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white" 
                          : isDarkMode 
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600"
                      }`}>
                        {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className={`font-semibold truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {contact.firstName} {contact.lastName}
                          </h3>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig[contact.status].color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[contact.status].dotColor}`}></span>
                            {statusConfig[contact.status].label}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{contact.email}</p>
                        <div className="mt-2 flex items-center gap-4 text-sm">
                          <span className="text-indigo-600 font-medium">{contact.product}</span>
                          <span className={isDarkMode ? "text-gray-600" : "text-gray-400"}>•</span>
                          <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>{formatShortDate(contact.createdAt)}</span>
                        </div>
                        <p className={`mt-2 text-sm line-clamp-2 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{contact.message}</p>
                      </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openGmailReply(contact);
                        }}
                        className="p-2 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
                        title="Reply via Gmail"
                      >
                        <PaperAirplaneIcon className="h-5 w-5" />
                      </button>
                      <a
                        href={`https://wa.me/${contact.phoneNumber.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <PhoneIcon className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? "border-gray-700 bg-indigo-900/20" : "border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50"}`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-semibold ${
                  selectedContact.status === "new" 
                    ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white" 
                    : isDarkMode
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600"
                }`}>
                  {selectedContact.firstName.charAt(0)}{selectedContact.lastName.charAt(0)}
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {selectedContact.firstName} {selectedContact.lastName}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{formatDate(selectedContact.createdAt)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                className={`p-2 rounded-lg transition-colors ${isDarkMode ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200" : "hover:bg-white/70 text-gray-500 hover:text-gray-700"}`}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Status Badge */}
              <div className="mb-6">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${statusConfig[selectedContact.status].color}`}>
                  <span className={`w-2 h-2 rounded-full ${statusConfig[selectedContact.status].dotColor}`}></span>
                  {statusConfig[selectedContact.status].label}
                </span>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <a
                  href={`mailto:${selectedContact.email}`}
                  className={`flex items-center gap-3 p-4 rounded-xl transition-colors group ${isDarkMode ? "bg-gray-700/50 hover:bg-gray-700" : "bg-gray-50 hover:bg-gray-100"}`}
                >
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200">
                    <EnvelopeIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className={`text-xs uppercase tracking-wider ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>Email</div>
                    <div className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{selectedContact.email}</div>
                  </div>
                </a>
                <a
                  href={`tel:${selectedContact.phoneNumber}`}
                  className={`flex items-center gap-3 p-4 rounded-xl transition-colors group ${isDarkMode ? "bg-gray-700/50 hover:bg-gray-700" : "bg-gray-50 hover:bg-gray-100"}`}
                >
                  <div className="p-2 rounded-lg bg-green-100 text-green-600 group-hover:bg-green-200">
                    <PhoneIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className={`text-xs uppercase tracking-wider ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>Phone</div>
                    <div className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{selectedContact.phoneNumber}</div>
                  </div>
                </a>
              </div>

              {/* Product Interest */}
              <div className="mb-6">
                <div className={`text-xs uppercase tracking-wider mb-2 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>Product Interest</div>
                <div className={`inline-flex items-center px-4 py-2 rounded-lg font-medium ${isDarkMode ? "bg-indigo-900/30 border border-indigo-700 text-indigo-400" : "bg-indigo-50 border border-indigo-200 text-indigo-700"}`}>
                  {selectedContact.product}
                </div>
              </div>

              {/* Message */}
              <div>
                <div className={`text-xs uppercase tracking-wider mb-2 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>Message</div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                  <p className={`whitespace-pre-wrap leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {selectedContact.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-6 border-t ${isDarkMode ? "border-gray-700 bg-gray-700/30" : "border-gray-200 bg-gray-50"}`}>
              <div className="flex flex-wrap gap-3">
                {/* Reply via Gmail - Primary Action */}
                <button
                  onClick={() => openGmailReply(selectedContact)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                  Reply via Gmail
                </button>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/${selectedContact.phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${selectedContact.firstName}, thank you for your inquiry about ${selectedContact.product}. `)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-100 text-green-700 font-medium hover:bg-green-200 transition-colors border border-green-200"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>

                {/* Status Actions */}
                {selectedContact.status !== "replied" && (
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: selectedContact._id, status: "replied" })}
                    className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors border ${isDarkMode ? "bg-gray-700 text-green-400 border-gray-600 hover:bg-gray-600" : "bg-white text-green-600 border-gray-200 hover:bg-green-50"}`}
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    Mark Replied
                  </button>
                )}
                {selectedContact.status !== "archived" && (
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: selectedContact._id, status: "archived" })}
                    className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors border ${isDarkMode ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"}`}
                  >
                    <ArchiveBoxIcon className="h-5 w-5" />
                    Archive
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this contact?")) {
                      deleteMutation.mutate(selectedContact._id);
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors border border-red-200"
                >
                  <TrashIcon className="h-5 w-5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
