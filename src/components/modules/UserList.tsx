import { Check, Trash } from "lucide-react";
import Button from "../ui/Button";
import { useUser } from "@/core/hooks/useUser";
import { useState } from "react";
import Input from "../ui/Input";

const UserList = () => {
  const {
    users,
    loading,
    error,
    page,
    nextPage,
    prevPage,
    filters,
    updateFilters,
    verifyUser,
    deleteUser
  } = useUser();
  const [type, setType] = useState(filters.type || "");
  const [isVerify, setIsVerify] = useState(filters.is_verify);
  const [email, setEmail] = useState(filters.email);

  const handleFilter = () => {
    updateFilters({ type: type || undefined, is_verify: isVerify, email: email || undefined });
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-gray-500">Loading users...</div>
    );
  }

  if (error) {
    return <div className="py-10 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="flex flex-col w-3/4 px-8 gap-4">
      <div className="flex justify-between items-center ">
        <Input type="text" name="email" id="email" onChange={(e) => setEmail(e.target.value)} placeholder="Search Email" />
        <select
          className="p-2 border border-gray-300 rounded-lg w-1/4 text-gray-700"
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">Select Type</option>
          <option value="company">Company</option>
          <option value="student">Student</option>
          <option value="university">University</option>
        </select>
        <select
          className=" p-2 border border-gray-300 rounded-lg w-1/4 text-gray-700"
          onChange={(e) => {
            const value = e.target.value;
            if (value === "") {
              setIsVerify(undefined);
            } else if (value === "true") {
              setIsVerify(true);
            } else {
              setIsVerify(false);
            }
          }}
        >
          <option value="">Select Verification</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>
        <Button
          className="ml-4 bg-amber-600 rounded-lg p-2 text-white cursor-pointer"
          onClick={handleFilter}
        >
          Filter
        </Button>
      </div>
      <table className="text-[#666666] text-center rounded-lg overflow-hidden border border-gray-300">
        <thead className="bg-amber-500 text-white">
          <tr>
            <th className="p-2">User ID</th>
            <th className="p-2">Email</th>
            <th className="p-2">Type</th>
            <th className="p-2">Verified Status</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.user_id} className="odd:bg-white even:bg-gray-200">
              <td className="p-2">{user.user_id}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.type}</td>
              <td className="p-2">
                {user.is_verify ? "Verified" : "Unverified"}
              </td>
              <td className="p-2 space-x-2">
                <Button
                  className={`text-white p-1 rounded-full ${
                    !user.is_verify
                      ? "bg-green-500 cursor-pointer"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                  onClick={() => verifyUser(user.user_id)}
                  disabled={user.is_verify}
                >
                  <Check />
                </Button>
                {/* <Button
                  className="bg-blue-500 text-white p-1 rounded-full cursor-pointer"
                  onClick={() => alert(`Edit user ${user.user_id}`)}
                >
                  <SquarePen />
                </Button> */}
                <Button
                  className="border border-red-600 text-red-500 p-1 rounded-full cursor-pointer"
                  onClick={() => deleteUser(user.user_id)}
                >
                  <Trash />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={5} className="p-2 text-sm text-gray-500">
              <div className="flex justify-between items-center">
                <Button
                  className={`bg-amber-600 rounded-lg p-2 text-white ${
                    page === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                  onClick={prevPage}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="">Page {page}</span>
                <Button
                  className={`bg-amber-600 rounded-lg p-2 text-white cursor-pointer`}
                  onClick={nextPage}
                >
                  Next
                </Button>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default UserList;
