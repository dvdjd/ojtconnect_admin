import React, { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { api } from "@/lib/utils/api";

interface IData {
  username: string;
}

interface IResponse {
  status: string;
  message: string;
  data?: IData;
}

const Login = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Logging in with:", username);

    const data = {
      username,
      password,
    };

    const response = await api.post<IResponse>("/api/login", data);

    if (response.status === "success") {
      router.push("/dashboard");
    } else {
      alert("Login failed: " + response.message);
    }
  };
  return (
    <form className="flex flex-col gap-4 items-start" onSubmit={handleLogin}>
      <Input
        type="text"
        name="username"
        id="username"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Input
        type="password"
        name="password"
        id="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button className="bg-amber-500 py-2 px-3 rounded-md text-white" type="submit" >Login</Button>
    </form>
  );
};

export default Login;
