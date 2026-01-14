const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrate() {
    console.log("Starting Team ID Migration...");

    const members = await prisma.teamMember.findMany({
        orderBy: { createdAt: 'asc' }
    });

    console.log(`Found ${members.length} members.`);

    // specific mapping for requested users
    // case insensitive check just in case
    const specificMap = {
        'avinash': 'AS001',
        'rahul': 'AS002',
        'varun': 'AS003'
    };

    let nextId = 4; // Start auto-assigning from AS004

    for (const member of members) {
        const lowerName = member.name.toLowerCase();
        let newId = '';

        // Check if member name contains the key (firstName check mainly)
        const specificKey = Object.keys(specificMap).find(key => lowerName.startsWith(key));

        if (specificKey) {
            newId = specificMap[specificKey];
            console.log(`Assigning reserved ID ${newId} to ${member.name}`);
        } else {
            // Check if they already have an ASxxx format to avoid double migration if re-run (simple check)
            if (member.accessId.startsWith('AS') && !member.accessId.startsWith('ASK-')) {
                // Try to respect existing if it looks like our new format, but for safety in this specific transition
                // we will re-assign unless it matches exact format and logic, but here assume clean slate or overwrite.
                // Actually, let's just overwrite to be sure.
            }

            newId = `AS${nextId.toString().padStart(3, '0')}`;
            nextId++;
            console.log(`Assigning new ID ${newId} to ${member.name}`);
        }

        await prisma.teamMember.update({
            where: { id: member.id },
            data: { accessId: newId }
        });
    }

    console.log("Migration completed.");
}

migrate()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
