import { useEffect, useState, useMemo } from "react";
import {
  Users,
  UserPlus,
  Search,
  Eye,
  Edit,
  Trash2,
  GraduationCap as GradCap,
  X,
  AlertCircle,
} from "lucide-react";

// Express API endpoint (port 4000)
const API_URL = "http://localhost:4000";

export default function StudentManagementSystem() {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal States
  const [activeModal, setActiveModal] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    batch: "",
    course: "",
    email: "",
    rollnumber: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/students`);
      if (!res.ok) throw new Error("Failed to fetch students");
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Cannot connect to server. Ensure Express API is running on port 4000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Performance optimized stats calculation
  const totalCourses = useMemo(() => {
    return new Set(students.map((s) => s.course).filter(Boolean)).size;
  }, [students]);

  const totalBatches = useMemo(() => {
    return new Set(students.map((s) => s.batch).filter(Boolean)).size;
  }, [students]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setFormData({ name: "", batch: "", course: "", email: "", rollnumber: "" });
    setActiveModal("add");
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name || "",
      batch: student.batch || "",
      course: student.course || "",
      email: student.email || "",
      rollnumber: student.rollnumber || student.rollNumber || "",
    });
    setActiveModal("edit");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const isEdit = activeModal === "edit";
      const url = isEdit
        ? `${API_URL}/students/${selectedStudent.id}`
        : `${API_URL}/students`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || errData.error || "Operation failed");
      }

      setActiveModal(null);
      fetchStudents();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/students/${selectedStudent.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete student");

      setActiveModal(null);
      fetchStudents();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    const rollNo = (s.rollnumber || s.rollNumber || "").toString().toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      rollNo.includes(q) ||
      s.course?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 flex flex-col font-sans p-6 sm:p-10 space-y-8">
      {/* Top Header */}
      <header className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-4">
          <div className="bg-[#0b132b] border border-slate-800/80 p-2.5 rounded-xl text-slate-100 shadow-inner">
            <GradCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">EduSystem</h1>
            <p className="text-xs text-slate-400">Student Management Portal</p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#1d4ed8] hover:bg-blue-600 active:scale-95 text-white px-5 py-2.5 rounded-2xl text-sm font-semibold transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Add Student
        </button>
      </header>

      {/* Main Container */}
      <main className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Card 1: Total Students */}
          <div className="bg-[#0a0f24] border border-slate-800/80 p-6 rounded-3xl flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">TOTAL STUDENTS</p>
              <h3 className="text-4xl font-extrabold text-white">
                {loading ? (
                  <span className="animate-pulse text-slate-600">...</span>
                ) : (
                  students.length
                )}
              </h3>
            </div>
            <div className="bg-[#0b1536] border border-slate-800/80 p-4 rounded-2xl text-cyan-400">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Total Courses */}
          <div className="bg-[#0a0f24] border border-slate-800/80 p-6 rounded-3xl space-y-2">
            <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">TOTAL COURSES</p>
            <h3 className="text-4xl font-extrabold text-white">
              {loading ? (
                <span className="animate-pulse text-slate-600">...</span>
              ) : (
                totalCourses
              )}
            </h3>
          </div>

          {/* Card 3: Total Batches */}
          <div className="bg-[#0a0f24] border border-slate-800/80 p-6 rounded-3xl space-y-2">
            <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">TOTAL BATCHES</p>
            <h3 className="text-4xl font-extrabold text-white">
              {loading ? (
                <span className="animate-pulse text-slate-600">...</span>
              ) : (
                totalBatches
              )}
            </h3>
          </div>
        </div>

        {/* Search Toolbar */}
        <div className="bg-[#0a0f24] border border-slate-800/80 px-6 py-4 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, roll no, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#050814] border border-slate-800 rounded-full pl-11 pr-5 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-slate-700"
            />
          </div>
          <p className="text-xs text-slate-400">
            Showing <span className="font-bold text-white">{loading ? "..." : filteredStudents.length}</span> records
          </p>
        </div>

        {/* Table View */}
        <div className="bg-[#0a0f24] border border-slate-800/80 rounded-3xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm animate-pulse">Loading records...</div>
          ) : error ? (
            <div className="p-12 text-center text-red-400 text-sm flex flex-col items-center gap-2">
              <AlertCircle className="w-8 h-8" />
              {error}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">No students found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-200">
                <thead className="bg-[#070b1b] text-[11px] font-bold uppercase text-slate-400 border-b border-slate-800/80">
                  <tr>
                    <th className="py-5 px-6">ID</th>
                    <th className="py-5 px-6">NAME</th>
                    <th className="py-5 px-6">ROLL NO</th>
                    <th className="py-5 px-6">COURSE</th>
                    <th className="py-5 px-6">BATCH</th>
                    <th className="py-5 px-6">EMAIL</th>
                    <th className="py-5 px-6 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-5 px-6 text-slate-400 font-medium">#{student.id}</td>
                      <td className="py-5 px-6 font-bold text-white">{student.name}</td>
                      <td className="py-5 px-6 text-cyan-400 font-medium">{student.rollnumber || student.rollNumber}</td>
                      <td className="py-5 px-6 text-slate-300">{student.course}</td>
                      <td className="py-5 px-6 text-slate-300">{student.batch}</td>
                      <td className="py-5 px-6 text-slate-300">{student.email}</td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-4 text-slate-300">
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setActiveModal("view");
                            }}
                            className="hover:text-cyan-400 transition cursor-pointer"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(student)}
                            className="hover:text-amber-400 transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setActiveModal("delete");
                            }}
                            className="hover:text-red-400 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {(activeModal === "add" || activeModal === "edit") && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0f24] border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">
                {activeModal === "edit" ? "Edit Student" : "Add New Student"}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-[#050814] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-slate-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Roll Number *</label>
                  <input
                    type="text"
                    name="rollnumber"
                    required
                    value={formData.rollnumber}
                    onChange={handleInputChange}
                    className="w-full bg-[#050814] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Batch *</label>
                  <input
                    type="text"
                    name="batch"
                    required
                    value={formData.batch}
                    onChange={handleInputChange}
                    className="w-full bg-[#050814] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-slate-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Course *</label>
                <input
                  type="text"
                  name="course"
                  required
                  value={formData.course}
                  onChange={handleInputChange}
                  className="w-full bg-[#050814] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-slate-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-[#050814] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-slate-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#1d4ed8] hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === "view" && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0f24] border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Student Details</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Name</p>
                <p className="font-bold text-white">{selectedStudent.name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Roll No</p>
                <p className="text-cyan-400">{selectedStudent.rollnumber || selectedStudent.rollNumber}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Course</p>
                <p className="text-slate-200">{selectedStudent.course}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Batch</p>
                <p className="text-slate-200">{selectedStudent.batch}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Email</p>
                <p className="text-slate-200">{selectedStudent.email}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === "delete" && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0f24] border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Confirm Delete</h3>
            <p className="text-sm text-slate-300">
              Are you sure you want to delete <span className="font-bold text-white">{selectedStudent.name}</span>?
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                {isSubmitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}