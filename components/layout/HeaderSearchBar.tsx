import { Search } from "lucide-react";
import Form from "next/form";
import React from "react";

const HeaderSearchBar = () => {
  return (
    //redirect --> /search?query=XYZ
    <Form action="/search">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
          <Search size={20} className="size-4 text-gray-400" />
        </div>
        <input
          type="text"
          name="query"
          placeholder="search"
          className="w-32 pl-8 py-1 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-black focus:border-transparent transition-colors"
        />
      </div>
    </Form>
  );
};

export default HeaderSearchBar;
