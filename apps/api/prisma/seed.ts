import argon2 from "argon2";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const permissionsByRole: Record<string, string[]> = {
  CUSTOMER: [
    "profile.view",
    "profile.update",
    "password.change",
    "bookings.view",
    "bookings.create",
    "tickets.view",
  ],
  TRAVEL_AGENT: [
    "profile.view",
    "profile.update",
    "password.change",
    "agent.dashboard",
    "users.view",
    "bookings.view",
    "bookings.create",
    "bookings.update",
    "reports.view",
  ],
  ADMIN: [
    "admin.dashboard",
    "users.create",
    "users.view",
    "users.edit",
    "users.delete",
    "roles.view",
    "roles.manage",
    "permissions.view",
    "permissions.manage",
    "bookings.view",
    "bookings.update",
    "reports.view",
    "settings.manage",
    "activity.view",
  ],
};

const emailTemplates = [
  {
    key: "welcome",
    subject: "Welcome to Vriddhi Nexus",
    htmlBody: "<p>Welcome {{firstName}}, your Vriddhi Nexus account is ready.</p>",
    textBody: "Welcome {{firstName}}, your Vriddhi Nexus account is ready.",
    variables: ["firstName"],
  },
  {
    key: "verify-email",
    subject: "Verify your Vriddhi Nexus email",
    htmlBody: "<p>Use this verification link: {{verificationUrl}}</p>",
    textBody: "Use this verification link: {{verificationUrl}}",
    variables: ["verificationUrl"],
  },
  {
    key: "forgot-password",
    subject: "Reset your Vriddhi Nexus password",
    htmlBody: "<p>Use this password reset link: {{resetUrl}}</p>",
    textBody: "Use this password reset link: {{resetUrl}}",
    variables: ["resetUrl"],
  },
  {
    key: "password-changed",
    subject: "Your Vriddhi Nexus password changed",
    htmlBody: "<p>Your password was changed. Contact support if this was not you.</p>",
    textBody: "Your password was changed. Contact support if this was not you.",
    variables: [],
  },
] as const;

async function main(): Promise<void> {
  for (const [roleCode, permissions] of Object.entries(permissionsByRole)) {
    const role = await prisma.role.upsert({
      where: { code: roleCode },
      update: {
        name: toTitle(roleCode),
        isSystem: true,
      },
      create: {
        code: roleCode,
        name: toTitle(roleCode),
        description: `${toTitle(roleCode)} role`,
        isSystem: true,
      },
    });

    for (const code of permissions) {
      const permission = await prisma.permission.upsert({
        where: { code },
        update: {},
        create: {
          code,
          description: `${code} permission`,
        },
      });

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }

  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { code: "ADMIN" },
  });
  const customerRole = await prisma.role.findUniqueOrThrow({
    where: { code: "CUSTOMER" },
  });
  const adminPassword = await argon2.hash("ChangeMe@123", {
    type: argon2.argon2id,
  });
  const customerPassword = await argon2.hash("ChangeMe@123", {
    type: argon2.argon2id,
  });
  const admin = await prisma.user.upsert({
    where: { email: "admin@vriddhinexus.com" },
    update: {
      roleId: adminRole.id,
      status: "ACTIVE",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      forcePasswordChange: true,
    },
    create: {
      firstName: "Vriddhi",
      lastName: "Admin",
      email: "admin@vriddhinexus.com",
      phone: "+910000000001",
      passwordHash: adminPassword,
      roleId: adminRole.id,
      status: "ACTIVE",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      forcePasswordChange: true,
    },
  });
  const customer = await prisma.user.upsert({
    where: { email: "user@vriddhinexus.com" },
    update: {
      roleId: customerRole.id,
      status: "ACTIVE",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      forcePasswordChange: false,
    },
    create: {
      firstName: "Customer",
      lastName: "User",
      email: "user@vriddhinexus.com",
      phone: "+910000000002",
      passwordHash: customerPassword,
      roleId: customerRole.id,
      status: "ACTIVE",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      forcePasswordChange: false,
    },
  });

  await prisma.userRoleAssignment.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: adminRole.id,
    },
  });
  await prisma.userRoleAssignment.upsert({
    where: {
      userId_roleId: {
        userId: customer.id,
        roleId: customerRole.id,
      },
    },
    update: {},
    create: {
      userId: customer.id,
      roleId: customerRole.id,
    },
  });
  await prisma.customer.upsert({
    where: { userId: customer.id },
    update: {
      fullName: "Customer User",
      email: customer.email,
      phone: customer.phone,
      status: "ACTIVE",
    },
    create: {
      userId: customer.id,
      fullName: "Customer User",
      email: customer.email,
      phone: customer.phone,
      status: "ACTIVE",
    },
  });

  for (const template of emailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { key: template.key },
      update: {
        subject: template.subject,
        htmlBody: template.htmlBody,
        textBody: template.textBody,
        variables: [...template.variables],
        isActive: true,
      },
      create: {
        key: template.key,
        subject: template.subject,
        htmlBody: template.htmlBody,
        textBody: template.textBody,
        variables: [...template.variables],
      },
    });
  }

  for (const supplier of [
    ["BCI", "BCI"],
    ["REDBUS", "RedBus"],
    ["ABHIBUS", "AbhiBus"],
    ["TBO", "TBO"],
    ["CUSTOM", "Custom"],
  ] as const) {
    await prisma.supplier.upsert({
      where: { code: supplier[0] },
      update: {},
      create: {
        code: supplier[0],
        name: supplier[1],
      },
    });
  }
}

function toTitle(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
