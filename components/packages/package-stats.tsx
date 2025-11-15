import { Package, CheckCircle, XCircle, Clock } from 'lucide-react'

interface PackageStatsProps {
  total: number
  active: number
  inactive: number
  avgDuration: number
}

export default function PackageStats({ total, active, inactive, avgDuration }: PackageStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Packages</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{total}</p>
          </div>
          <Package className="w-10 h-10 text-blue-600" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{active}</p>
          </div>
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Inactive</p>
            <p className="text-3xl font-bold text-gray-600 mt-2">{inactive}</p>
          </div>
          <XCircle className="w-10 h-10 text-gray-600" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Avg. Duration</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {avgDuration.toFixed(1)}
              <span className="text-lg ml-1">days</span>
            </p>
          </div>
          <Clock className="w-10 h-10 text-purple-600" />
        </div>
      </div>
    </div>
  )
}
