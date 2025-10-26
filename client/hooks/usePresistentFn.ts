import { useCallback, useRef, useEffect } from "react";

export const usePersistentFn = <T extends (...args: any[]) => any>(fn: T): T => {
  const ref = useRef<T>(fn);
  
  // 使用useEffect确保ref.current始终指向最新的fn
  useEffect(() => {
    ref.current = fn;
  }, [fn]);

  // 返回一个稳定的函数引用，但内部调用最新的fn
  return useCallback((...args: any[]) => ref.current(...args), []) as T;
};
