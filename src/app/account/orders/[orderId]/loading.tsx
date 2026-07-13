import React from 'react';
import { ChevronLeft } from 'lucide-react';

export default function OrderDetailsLoading() {
  return (
    <div className="w-full min-h-screen bg-[#FCFBF9] py-12 text-left relative animate-pulse">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <ChevronLeft size={20} className="text-gray-400" />
            </div>
            <div>
              <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
              <div className="h-4 w-24 bg-gray-200 rounded mt-2"></div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
            <div className="h-10 w-36 bg-gray-200 rounded-lg"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#EFECE6] p-6 rounded-2xl">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-16 w-full bg-gray-200 rounded-lg"></div>
            </div>

            <div className="bg-white border border-[#EFECE6] p-6 rounded-2xl">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex justify-between gap-4 p-4 border border-[#EFECE6] rounded-xl">
                    <div className="flex space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="h-5 w-40 bg-gray-200 rounded"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="h-6 w-20 bg-gray-200 rounded"></div>
                      <div className="h-8 w-24 bg-gray-200 rounded-lg"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-[#EFECE6] p-6 rounded-2xl">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="flex justify-between border-t border-[#EFECE6] pt-4">
                  <div className="h-5 w-16 bg-gray-200 rounded"></div>
                  <div className="h-5 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#EFECE6] p-6 rounded-2xl">
              <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                <div className="h-4 w-24 bg-gray-200 rounded mt-4"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
