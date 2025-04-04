"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import Link from "next/link";
import React from "react";
import { setUser } from "@/lib/auth-client";
import { registerUser } from "@/lib/auth-server";
import { useRouter } from "next/navigation";

const RegisterPage = () => {
  const router = useRouter();

  const registerAction = async (data) => {
    const username = data.get("username");
    const password = data.get("password");
    const fname = data.get("fname");
    const lname = data.get("lname");
    const success = await registerUser(username, password, fname, lname);

    console.log(success);
    if (success) {
      setUser(username);
      router.push("/");
    } else {
      window.alert("Registration Failed");
    }
  };

  return (
    <div className={"flex flex-col gap-6 w-1/4"}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={registerAction}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="joedoe"
                  name="username"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" type="password" name="password" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fname">First Name</Label>
                <Input
                  id="fname"
                  type="text"
                  placeholder="Joe"
                  name="fname"
                  required
                />
              </div>{" "}
              <div className="grid gap-2">
                <Label htmlFor="lname">Last Name</Label>
                <Input
                  id="lname"
                  type="text"
                  placeholder="Doe"
                  name="lname"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Register
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
