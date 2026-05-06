import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

/**
 * 全局错误边界 — 捕获子组件渲染异常，防止白屏
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4 px-6">
          <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
            <AlertTriangle size={22} className="text-red-500" />
          </div>
          <div className="text-center">
            <p className="text-slate-700 font-semibold mb-1">页面出了点问题</p>
            <p className="text-slate-400 text-sm max-w-sm">
              {this.state.error?.message || '未知错误'}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition"
          >
            刷新重试
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
