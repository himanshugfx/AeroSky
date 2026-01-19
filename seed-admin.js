const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash('admin', 12);
    const user = await prisma.user.upsert({
        where: { username: 'admin' },
        update: { passwordHash },
        create: {
            username: 'admin',
            passwordHash,
        },
    });
    console.log('Admin user set successfully: admin / admin');
}

main()
    .catch((e) => {
        console.error('Error seeding admin:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
