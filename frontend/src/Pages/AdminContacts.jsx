import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContacts, updateContactStatus, deleteContact } from "../api";
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  TrashIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const statusColors = {
  new: "bg-blue-100 text-blue-800",
  read: "bg-yellow-100 text-yellow-800",
  replied: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-800",
};

export default function AdminContacts() {
  const queryClient = useQueryClient();
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

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Contact Submissions</h1>
          <p className="mt-2 text-sm text-gray-700">
            View and manage customer inquiries from the contact form.
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="mt-4 flex gap-2">
        {["", "new", "read", "replied", "archived"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              filter === status
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {status === "" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-8 text-center text-gray-500">Loading...</div>
      ) : error ? (
        <div className="mt-8 text-center text-red-500">Failed to load contacts</div>
      ) : contacts.length === 0 ? (
        <div className="mt-8 text-center text-gray-500">No contact submissions yet.</div>
      ) : (
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                        Customer
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Product Interest
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Date
                      </th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {contacts.map((contact) => (
                      <tr
                        key={contact._id}
                        className={`cursor-pointer hover:bg-gray-50 ${
                          contact.status === "new" ? "bg-blue-50/30" : ""
                        }`}
                        onClick={() => setSelectedContact(contact)}
                      >
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                          <div className="font-medium text-gray-900">
                            {contact.firstName} {contact.lastName}
                          </div>
                          <div className="text-gray-500">{contact.email}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {contact.product}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              statusColors[contact.status]
                            }`}
                          >
                            {contact.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatDate(contact.createdAt)}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedContact(contact);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View
                          </button>
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

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedContact.firstName} {selectedContact.lastName}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(selectedContact.createdAt)}
                  </p>
                </div>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    statusColors[selectedContact.status]
                  }`}
                >
                  {selectedContact.status}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="text-indigo-600 hover:underline"
                  >
                    {selectedContact.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <PhoneIcon className="h-4 w-4 text-gray-400" />
                  <a
                    href={`tel:${selectedContact.phoneNumber}`}
                    className="text-indigo-600 hover:underline"
                  >
                    {selectedContact.phoneNumber}
                  </a>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">Product Interest:</p>
                <p className="text-sm text-gray-900 mt-1">{selectedContact.product}</p>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">Message:</p>
                <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                  {selectedContact.message}
                </p>
              </div>

              {/* Status Actions */}
              <div className="mt-6 flex flex-wrap gap-2">
                {selectedContact.status === "new" && (
                  <button
                    onClick={() =>
                      updateStatusMutation.mutate({
                        id: selectedContact._id,
                        status: "read",
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-md hover:bg-yellow-200"
                  >
                    <EyeIcon className="h-4 w-4" />
                    Mark as Read
                  </button>
                )}
                {selectedContact.status !== "replied" && (
                  <button
                    onClick={() =>
                      updateStatusMutation.mutate({
                        id: selectedContact._id,
                        status: "replied",
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    Mark as Replied
                  </button>
                )}
                {selectedContact.status !== "archived" && (
                  <button
                    onClick={() =>
                      updateStatusMutation.mutate({
                        id: selectedContact._id,
                        status: "archived",
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    <ArchiveBoxIcon className="h-4 w-4" />
                    Archive
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this contact?")) {
                      deleteMutation.mutate(selectedContact._id);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </button>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedContact(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
