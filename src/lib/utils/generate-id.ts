import { PrismaClient } from "@prisma/client";

type Prefix = "U" | "S" | "C" | "T";

const tableMap: Record<Prefix, string> = {
  U: "user_access",
  S: "student_profile",
  C: "company_profile",
  T: "university_profile",
};

const idFieldMap: Record<Prefix, string> = {
  U: "user_id",
  S: "student_id",
  C: "company_id",
  T: "university_id",
};

export async function generateId(prisma: PrismaClient, prefix: Prefix): Promise<string> {
  const table = tableMap[prefix];
  const field = idFieldMap[prefix];

  // Only consider IDs matching the format: prefix + digits
  const result = await prisma.$queryRawUnsafe<{ max_num: number | null }[]>(`
    SELECT MAX(CAST(SUBSTRING(${field}, 2) AS INTEGER)) AS max_num
    FROM ${table}
    WHERE ${field} ~ '^${prefix}[0-9]+$'
  `);

  const lastNum = result[0]?.max_num ?? 0;
  const nextNum = lastNum + 1;
  return `${prefix}${String(nextNum).padStart(7, "0")}`;
}
