import { PrismaClient } from '@prisma/client';
export declare const prisma: PrismaClient<{
    log: ({
        emit: "event";
        level: "query";
    } | {
        emit: "stdout";
        level: "error";
    } | {
        emit: "stdout";
        level: "warn";
    } | {
        emit: "stdout";
        level: "info";
    })[];
}, "query", import("@prisma/client/runtime/library").DefaultArgs>;
export default prisma;
//# sourceMappingURL=prisma.d.ts.map