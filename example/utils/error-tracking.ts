import { usePostHog } from "posthog-react-native"
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from "@tanstack/react-query"

interface ErrorContext {
  queryKey?: readonly unknown[]
  variables?: unknown
  timestamp?: string
  userId?: string
  metadata?: Record<string, unknown>
}

export class TrackedError extends Error {
  constructor(
    message: string,
    public originalError: unknown,
    public context: ErrorContext = {},
  ) {
    super(message)
    this.name = "TrackedError"
  }
}

export function usePostHogErrorTracking() {
  const posthog = usePostHog()

  const trackError = (error: unknown, context: ErrorContext = {}) => {
    const errorData: Parameters<typeof posthog.capture>[1] = {
      error_message: error instanceof Error ? error.message : String(error),
      error_name: error instanceof Error ? error.name : "UnknownError",
      timestamp: new Date().toISOString(),
      ...(context.queryKey ? { queryKey: JSON.stringify(context.queryKey) } : {}),
      ...(context.variables ? { variables: JSON.stringify(context.variables) } : {}),
      ...(context.userId ? { userId: context.userId } : {}),
      ...(context.metadata ? { metadata: JSON.stringify(context.metadata) } : {}),
    }

    posthog.capture("error", errorData)

    // Also log to console for development
    if (__DEV__) {
      console.error("Tracked error:", errorData)
    }
  }

  return { trackError } as const
}

export function useTrackedQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = readonly unknown[],
>(options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>) {
  const { trackError } = usePostHogErrorTracking()

  const wrappedQueryFn =
    options.queryFn && typeof options.queryFn === "function"
      ? async (...args: any[]) => {
          try {
            return await (options.queryFn as any)(...args)
          } catch (error) {
            trackError(error, {
              metadata: {
                type: "query",
                ...options,
              },
            })
            throw error
          }
        }
      : options.queryFn

  return useQuery<TQueryFnData, TError, TData, TQueryKey>({
    ...options,
    queryFn: wrappedQueryFn,
  })
}

export function useTrackedMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(options: UseMutationOptions<TData, TError, TVariables, TContext>) {
  const { trackError } = usePostHogErrorTracking()

  const wrappedMutationFn = options.mutationFn
    ? async (variables: TVariables) => {
        try {
          return await options.mutationFn!(variables)
        } catch (error) {
          trackError(error, {
            variables,
            metadata: {
              ...options,
            },
          })
          throw error
        }
      }
    : undefined

  return useMutation<TData, TError, TVariables, TContext>({
    ...options,
    mutationFn: wrappedMutationFn,
    onError: (error, variables, context) => {
      // Additional tracking for mutations that fail outside the mutationFn
      trackError(error, {
        variables,
        metadata: {
          ...options,
          // Not needed I think
          // context,
        },
      })

      // Call original onError if provided
      options.onError?.(error, variables, context)
    },
  })
}

// Wrapper function that can be used to wrap any async function
export function withErrorTracking<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: Omit<ErrorContext, "timestamp"> = {},
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      // Use PostHog directly since this might be called outside React components
      const posthog = require("posthog-react-native").getPostHogInstance?.()

      if (posthog) {
        const baseErrorData = {
          error_message: error instanceof Error ? error.message : String(error),
          error_name: error instanceof Error ? error.name : "UnknownError",
          timestamp: new Date().toISOString(),
          arguments: JSON.stringify(args),
        } as const

        const errorStackData =
          error instanceof Error && error.stack ? { error_stack: error.stack } : {}

        const queryKeyData = context.queryKey ? { queryKey: JSON.stringify(context.queryKey) } : {}

        const variablesData = context.variables
          ? { variables: JSON.stringify(context.variables) }
          : {}

        const userIdData = context.userId ? { userId: context.userId } : {}

        const metadataData = context.metadata ? { metadata: JSON.stringify(context.metadata) } : {}

        const errorData = {
          ...baseErrorData,
          ...errorStackData,
          ...queryKeyData,
          ...variablesData,
          ...userIdData,
          ...metadataData,
        }

        posthog.capture("async_function_error", errorData)
      }

      if (__DEV__) {
        console.error("Tracked async function error:", error, context)
      }

      throw error
    }
  }) as T
}
