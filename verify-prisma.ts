import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("Checking Prisma Client schema...")
    try {
        // Attempt to access the property via dmmf or metadata if possible, 
        // but a simple query is better.
        const sample = await prisma.picklistLine.findFirst()
        console.log("Found PicklistLine:", sample)
        if (sample && 'stockMode' in sample) {
            console.log("SUCCESS: stockMode field is present in the runtime object.")
        } else if (sample) {
            console.log("FAILURE: stockMode field is MISSING in the runtime object.")
        } else {
            console.log("No data found to verify runtime object, but query succeeded.")
        }
    } catch (e: any) {
        console.error("PRISMA ERROR:", e.message)
    } finally {
        await prisma.$disconnect()
    }
}

main()
