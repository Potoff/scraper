import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { createScrapingSearch, getScrapingSearch, updateScrapingSearch, getBusinessResults, getUserScrapingSearches, addBusinessResult } from "./db";
import { scrapeBusinesses } from "./scraper";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  scraping: router({
    // Authentication disabled for testing - using publicProcedure instead of protectedProcedure
    startSearch: publicProcedure
      .input(z.object({
        department: z.string().min(1, "Department is required"),
        sector: z.string().min(1, "Sector is required"),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Use a default user ID for testing when no user is authenticated
          const userId = ctx.user?.id ?? 1;

          const search = await createScrapingSearch(
            userId,
            input.department,
            input.sector
          );

          if (!search) {
            throw new Error("Failed to create search");
          }

          // Start scraping in background (non-blocking)
          scrapeBusinesses(search.id, input.department, input.sector)
            .catch(error => {
              console.error('Background scraping failed:', error);
            });

          return { searchId: search.id };
        } catch (error: unknown) {
          console.error("Failed to start search:", error);
          throw error;
        }
      }),

    getSearch: publicProcedure
      .input(z.object({
        searchId: z.number(),
      }))
      .query(async ({ input }) => {
        return await getScrapingSearch(input.searchId);
      }),

    getResults: publicProcedure
      .input(z.object({
        searchId: z.number(),
      }))
      .query(async ({ input }) => {
        return await getBusinessResults(input.searchId);
      }),

    getHistory: publicProcedure
      .query(async ({ ctx }) => {
        // Use a default user ID for testing when no user is authenticated
        const userId = ctx.user?.id ?? 1;
        return await getUserScrapingSearches(userId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
