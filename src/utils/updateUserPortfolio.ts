import { PortfolioState } from "@/types";
import { supabase } from "./supabaseClient";

/**
 * Updates the portfolio for a given user.
 *
 * @param publicAddress The user's public wallet address.
 * @param portfolio The new portfolio state to save.
 * @returns The updated user data or null if an error occurred.
 */
export const updateUserPortfolio = async (
  publicAddress: string,
  portfolio: PortfolioState
) => {
  if (!publicAddress) {
    console.error("updateUserPortfolio Error: publicAddress is missing.");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .update({ portfolio: portfolio })
      .eq("userPublicAddress", publicAddress)
      .select()
      .single();

    if (error) {
      throw error;
    }
    console.log("Successfully updated portfolio for user:", publicAddress);
    return data;
  } catch (error) {
    console.error(
      "Database error in updateUserPortfolio:",
      (error as Error).message
    );
    return null;
  }
};
