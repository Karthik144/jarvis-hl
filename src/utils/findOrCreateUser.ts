import { supabase } from "./supabaseClient";

/**
 * Finds a user by their public address. If the user doesn't exist, it creates a new entry.
 * This function is idempotent, meaning it can be called multiple times without creating duplicate users.
 *
 * @param publicAddress The user's public wallet address.
 * @returns The user's data from the database, or null if an error occurs or the address is invalid.
 */
export const findOrCreateUser = async (publicAddress: string | undefined) => {
  if (!publicAddress) {
    console.error(
      "findOrCreateUser Error: publicAddress is missing or invalid."
    );
    return null;
  }

  try {
    const { data: existingUser, error: selectError } = await supabase
      .from("users")
      .select("*")
      .eq("userPublicAddress", publicAddress)
      .maybeSingle();

    if (selectError) {
      throw selectError;
    }

    if (existingUser) {
      console.log(`User ${publicAddress} already exists.`);
      return existingUser;
    }

    console.log(`Creating new user for ${publicAddress}...`);
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({ userPublicAddress: publicAddress })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    console.log(`Successfully created user:`, newUser);
    return newUser;
  } catch (error) {
    console.error(
      "Database error in findOrCreateUser:",
      (error as Error).message
    );
    return null;
  }
};
