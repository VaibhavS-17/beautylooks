import React from 'react';
import { ChevronLeft } from 'lucide-react';

export default function OrdersLoading() {
  return (
    <div className="w-full min-h-screen bg-[#FCFBF9] py-12 text-left relative">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center animate-pulse">
            <ChevronLeft size={20} className="text-gray-400" />
          </div>
          <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-[#EFECE6] rounded-xl p-5 bg-white space-y-4 shadow-sm">
              <div className="flex justify-between border-b border-[#EFECE6] pb-3">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex space-x-3 items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-md animate-pulse"></div>
                    <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between border-t border-[#EFECE6] pt-3">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
