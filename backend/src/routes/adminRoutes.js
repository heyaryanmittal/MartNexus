const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const prisma = require('../utils/prismaClient');

const router = express.Router();

// --- User Management ---

// Get all users with their roles
router.get('/users', authenticateToken, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isVerified: true,
                createdAt: true,
                // If using profiles table (Supabase style migration)
            }
        });

        const userRoles = await prisma.userRole.findMany();

        const formattedUsers = users.map(user => ({
            ...user,
            full_name: user.name,
            roles: [
                ...(user.role ? [user.role.toLowerCase()] : []),
                ...userRoles.filter(ur => ur.user_id === user.id).map(ur => ur.role.toLowerCase())
            ]
        }));

        res.json(formattedUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Assign role to user
router.post('/users/:id/roles', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    try {
        // Add to UserRole table
        await prisma.userRole.upsert({
            where: {
                user_id_role: {
                    user_id: id,
                    role: role.toLowerCase()
                }
            },
            update: {},
            create: {
                user_id: id,
                role: role.toLowerCase()
            }
        });

        res.json({ success: true, message: 'Role assigned successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove role from user
router.delete('/users/:id/roles/:role', authenticateToken, async (req, res) => {
    const { id, role } = req.params;

    try {
        await prisma.userRole.delete({
            where: {
                user_id_role: {
                    user_id: id,
                    role: role.toLowerCase()
                }
            }
        });

        res.json({ success: true, message: 'Role removed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Audit Logs ---

router.get('/audit-logs', authenticateToken, async (req, res) => {
    const { table_name, action, user_id, date_from, date_to, page = 1, pageSize = 50 } = req.query;
    
    const where = {};
    if (table_name) where.table_name = table_name;
    if (action) where.action = action;
    if (user_id) where.user_id = user_id;
    if (date_from || date_to) {
        where.created_at = {};
        if (date_from) where.created_at.gte = new Date(date_from);
        if (date_to) where.created_at.lte = new Date(date_to);
    }

    try {
        const [logs, count] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                orderBy: { created_at: 'desc' },
                take: parseInt(pageSize),
                skip: (parseInt(page) - 1) * parseInt(pageSize)
            }),
            prisma.auditLog.count({ where })
        ]);

        // Fetch user info for logs
        const userIds = [...new Set(logs.map(l => l.user_id).filter(Boolean))];
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, email: true, name: true }
        });

        const userMap = users.reduce((acc, u) => {
            acc[u.id] = u;
            return acc;
        }, {});

        const formattedLogs = logs.map(log => {
            const old_data = log.old_values ? (typeof log.old_values === 'string' ? JSON.parse(log.old_values) : log.old_values) : null;
            const new_data = log.new_values ? (typeof log.new_values === 'string' ? JSON.parse(log.new_values) : log.new_values) : null;
            
            let changed_fields = [];
            if (log.action === 'UPDATE' && old_data && new_data) {
                changed_fields = Object.keys(new_data).filter(key => {
                    return JSON.stringify(old_data[key]) !== JSON.stringify(new_data[key]);
                });
            } else if (log.action === 'INSERT' && new_data) {
                changed_fields = Object.keys(new_data);
            } else if (log.action === 'DELETE' && old_data) {
                changed_fields = Object.keys(old_data);
            }

            return {
                ...log,
                old_data,
                new_data,
                changed_fields,
                user_email: log.user_id ? userMap[log.user_id]?.email : null,
                user_name: log.user_id ? userMap[log.user_id]?.name : null
            };
        });

        res.json({
            logs: formattedLogs,
            totalCount: count
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/audit-logs/tables', authenticateToken, async (req, res) => {
    try {
        const tables = await prisma.auditLog.findMany({
            select: { table_name: true },
            distinct: ['table_name']
        });
        res.json(tables.map(t => t.table_name).sort());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
