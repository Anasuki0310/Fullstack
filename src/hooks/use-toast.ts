/**
 * @file use-toast.ts
 * @description ฮุกและระบบจัดการการแจ้งเตือนแบบป็อปอัปสั้นๆ (Toast Notification Engine)
 * 
 * หน้าที่ของไฟล์นี้:
 * 1. ควบคุมสถานะของ Toast ทั้งหมดในหน่วยความจำ (In-memory State & Pub/Sub Pattern)
 * 2. จัดการคิวการแสดงผล กำหนดจำนวนแจ้งเตือนสูงสุด (TOAST_LIMIT = 5)
 * 3. จัดการการหน่วงเวลาเพื่อปิดและลบการแจ้งเตือนอัตโนมัติ (Auto-dismiss timeout = 4s)
 * 4. ส่งออก:
 *    - `toast(...)`: ฟังก์ชันสำหรับเรียกแสดงการแจ้งเตือนจากที่ใดก็ได้ในแอป (Imperative API)
 *    - `useToast()`: React hook สำหรับดึงรายการ toast มาเรนเดอร์ในคอมโพเนนต์ Toaster
 */

import * as React from "react"

export type ToastActionElement = React.ReactElement

export type ToastProps = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: "default" | "destructive" | "success"
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/** จำกัดจำนวน Toast ที่แสดงพร้อมกันบนหน้าจอ */
const TOAST_LIMIT = 5
/** ระยะเวลาหน่วงก่อนลบ Toast ออกจาก Memory อย่างสมบูรณ์ (4 วินาที) */
const TOAST_REMOVE_DELAY = 4000

type Action =
  | {
      type: "ADD_TOAST"
      toast: ToastProps
    }
  | {
      type: "UPDATE_TOAST"
      toast: Partial<ToastProps>
    }
  | {
      type: "DISMISS_TOAST"
      toastId?: ToastProps["id"]
    }
  | {
      type: "REMOVE_TOAST"
      toastId?: ToastProps["id"]
    }

interface State {
  toasts: ToastProps[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

/**
 * ฟังก์ชัน addToRemoveQueue:
 * บรรจุ ID ของ Toast เข้าสู่คิวเพื่อลบทิ้งออกจากหน่วยความจำหลังจากหมดเวลา delay
 */
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

/**
 * เรดิวเซอร์ reducer:
 * ควบคุมการเปลี่ยนแปลงสถานะของ Toast ตาม Action Type ต่างๆ
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

/**
 * ฟังก์ชัน dispatch:
 * อัปเดต State ผ่าน Reducer และแจ้งเตือน subscriber ทุกตัวที่กำลังฟังอยู่
 */
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

let count = 0

/**
 * ฟังก์ชัน genId:
 * สุ่มสร้าง Unique ID แบบ auto-increment สำหรับแต่ละ Toast
 */
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

export type Toast = Omit<ToastProps, "id">

/**
 * ฟังก์ชัน toast:
 * สั่งให้แสดงผล Toast โดยสามารถส่ง title, description, variant ได้
 * และคืนค่า method dismiss() และ update() ของ Toast นั้นๆ
 */
function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToastProps) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

/**
 * ฮุก useToast:
 * เชื่อมต่อคอมโพเนนต์เข้ากับ Toast State Listener เพื่อแสดงผลและปิด Toast ได้แบบ Reactive
 */
function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }

