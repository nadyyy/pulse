import { PermissionKey } from "@prisma/client";

import { createStaffUserAction, updateUserPermissionsAction } from "@/app/actions/admin";
import { requireUsersManage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const actor = await requireUsersManage();
  const canCreateAdmin = actor.role === "OWNER";

  const users = await prisma.user.findMany({
    include: {
      permissions: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="stack">
      <h1>Users</h1>
      <form action={createStaffUserAction} className="card stack">
        <h2>Create Staff / Customer</h2>
        <div className="grid-2">
          <label className="field">
            <span>Email</span>
            <input name="email" type="email" required />
          </label>
          <label className="field">
            <span>Password</span>
            <input name="password" type="password" minLength={8} required />
          </label>
          <label className="field">
            <span>Role</span>
            <select name="role" defaultValue="STAFF">
              <option value="STAFF">STAFF</option>
              {canCreateAdmin ? <option value="ADMIN">ADMIN</option> : null}
              <option value="CUSTOMER">CUSTOMER</option>
            </select>
          </label>
        </div>

        <div className="checkbox-grid">
          {Object.values(PermissionKey).map((permission) => (
            <label key={permission} className="row">
              <input type="checkbox" name="permissions" value={permission} />
              <span>{permission}</span>
            </label>
          ))}
        </div>

        <button className="button" type="submit">
          Create User
        </button>
      </form>

      {users.map((user) => (
        <article key={user.id} className="card stack">
          <h3>{user.email}</h3>
          <p className="muted">Role: {user.role}</p>
          {user.role === "STAFF" ? (
            <form action={updateUserPermissionsAction} className="stack">
              <input type="hidden" name="userId" value={user.id} />
              <div className="checkbox-grid">
                {Object.values(PermissionKey).map((permission) => (
                  <label key={permission} className="row">
                    <input
                      type="checkbox"
                      name="permissions"
                      value={permission}
                      defaultChecked={user.permissions.some(
                        (row) => row.key === permission,
                      )}
                    />
                    <span>{permission}</span>
                  </label>
                ))}
              </div>
              <button className="button ghost" type="submit">
                Update Permissions
              </button>
            </form>
          ) : null}
        </article>
      ))}
    </div>
  );
}
