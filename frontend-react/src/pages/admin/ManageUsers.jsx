import { useState, useEffect } from 'react';
import API from '../../services/api';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     fetchUsers();
  }, []);

  const fetchUsers = async () => {
      setLoading(true);
      try {
          const { data } = await API.get('/users');
          // Response shape is { success: true, count: X, users: [...] }
          if (data && data.users) {
              setUsers(data.users);
          }
      } catch (err) {
          console.error("Failed to fetch users", err);
      } finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto">
       <div className="mb-8 px-2">
           <h1 className="text-3xl font-bold text-slate-800 mb-1 border-l-4 border-brand-600 pl-4 -ml-4">User Management</h1>
           <p className="text-slate-500 text-sm">View all registered users in the system.</p>
       </div>

       {loading ? (
             <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
       ) : (
           <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
               <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
                   <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-200">
                       <tr>
                           <th className="px-6 py-4">User</th>
                           <th className="px-6 py-4">Contact</th>
                           <th className="px-6 py-4">Role</th>
                           <th className="px-6 py-4">Registered Date</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                       {users.map((user) => (
                           <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                               <td className="px-6 py-4 flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs border border-brand-200 shadow-sm">
                                       {user.name.charAt(0).toUpperCase()}
                                   </div>
                                   <div>
                                       <p className="text-slate-800 font-bold">{user.name}</p>
                                       <p className="text-slate-400 text-xs font-mono">{user._id}</p>
                                   </div>
                               </td>
                               <td className="px-6 py-4 font-medium text-slate-700">{user.email}</td>
                               <td className="px-6 py-4">
                                   <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                       {user.role}
                                   </span>
                               </td>
                               <td className="px-6 py-4 font-medium text-slate-500">
                                   {new Date(user.createdAt).toLocaleDateString()}
                               </td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
       )}
    </div>
  );
};

export default ManageUsers;
