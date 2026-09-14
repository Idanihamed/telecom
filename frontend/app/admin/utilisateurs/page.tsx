'use client';

import { Fragment, useEffect, useState } from 'react';
import {
  adminCreateUser,
  adminDeleteUser,
  adminListRoles,
  adminListUsers,
  adminUpdateUser,
} from '../../../lib/admin-api';
import { useLocale } from '../../../lib/i18n/context';
import type { Dictionary } from '../../../lib/i18n/dictionaries';
import type { AdminUserAccount, Role } from '../../../lib/types';

// Libellés lisibles pour les trois rôles pré-configurés par le seed (§27 du cahier des
// charges) — une valeur absente de ce dictionnaire (un rôle ajouté plus tard, par exemple)
// s'affiche simplement telle quelle, sans casser la page.
function roleLabel(t: Dictionary, roleName: string): string {
  const labels: Record<string, string> = {
    SUPER_ADMIN: t.usersPage.superAdmin,
    GESTIONNAIRE: t.usersPage.manager,
    EDITEUR: t.usersPage.editor,
  };
  return labels[roleName] ?? roleName;
}

export default function AdminUsersPage() {
  const { t } = useLocale();
  const [users, setUsers] = useState<AdminUserAccount[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Formulaire de création.
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleName, setRoleName] = useState('');
  const [creating, setCreating] = useState(false);

  // Édition en ligne (même schéma que /admin/categories).
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingEmail, setEditingEmail] = useState('');
  const [editingRole, setEditingRole] = useState('');

  // Réinitialisation de mot de passe (ligne à part de l'édition ci-dessus : le Super Admin
  // n'avait auparavant aucun moyen de récupérer un compte dont le mot de passe est oublié).
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetDoneId, setResetDoneId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [userList, roleList] = await Promise.all([adminListUsers(), adminListRoles()]);
      setUsers(userList);
      setRoles(roleList);
      if (!roleName && roleList.length > 0) setRoleName(roleList[0].name);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.usersPage.loadError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password || !roleName) return;
    setCreating(true);
    setError(null);
    try {
      await adminCreateUser({ name, email, password, roleName });
      setName('');
      setEmail('');
      setPassword('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.usersPage.createError);
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleActive(user: AdminUserAccount) {
    setError(null);
    try {
      await adminUpdateUser(user.id, { isActive: !user.isActive });
      await load();
    } catch (err) {
      // Ex. dernier Super Admin actif : voir UsersService.assertNotLastActiveSuperAdmin.
      setError(err instanceof Error ? err.message : t.usersPage.updateError);
    }
  }

  function startEdit(user: AdminUserAccount) {
    setEditingId(user.id);
    setEditingName(user.name);
    setEditingEmail(user.email);
    setEditingRole(user.role);
  }

  async function handleSaveEdit(id: string) {
    setError(null);
    try {
      await adminUpdateUser(id, { name: editingName, email: editingEmail, roleName: editingRole });
      setEditingId(null);
      await load();
    } catch (err) {
      // Ex. attribution du rôle Super Admin refusée : voir UsersService.assertCanAssignRole.
      setError(err instanceof Error ? err.message : t.usersPage.updateError);
    }
  }

  function startReset(id: string) {
    setResettingId(id);
    setNewPassword('');
    setResetDoneId(null);
  }

  async function handleResetPassword(id: string) {
    if (newPassword.length < 10) {
      setError(t.usersPage.passwordTooShort);
      return;
    }
    setResetting(true);
    setError(null);
    try {
      await adminUpdateUser(id, { password: newPassword });
      setResettingId(null);
      setNewPassword('');
      setResetDoneId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.usersPage.resetError);
    } finally {
      setResetting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t.usersPage.confirmDelete)) return;
    setError(null);
    try {
      await adminDeleteUser(id);
      await load();
    } catch (err) {
      // Ex. dernier Super Admin actif : voir UsersService.assertNotLastActiveSuperAdmin.
      setError(err instanceof Error ? err.message : t.usersPage.deleteError);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy">{t.usersPage.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.usersPage.subtitle}</p>
      </div>

      <form onSubmit={handleCreate} className="mb-6 grid gap-2 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.usersPage.namePlaceholder}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-1"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder={t.usersPage.emailPlaceholder}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-1"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder={t.usersPage.passwordPlaceholder}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-1"
        />
        <select
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-1"
        >
          {roles.map((r) => (
            <option key={r.id} value={r.name}>
              {roleLabel(t, r.name)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={creating}
          className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 sm:col-span-1"
        >
          {creating ? t.usersPage.creating : t.usersPage.createAccount}
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-accent">{error}</p>}

      {loading ? (
        <p className="text-slate-500">{t.common.loading}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2">{t.adminCommon.name}</th>
                <th className="px-4 py-2">{t.usersPage.email}</th>
                <th className="px-4 py-2">{t.usersPage.role}</th>
                <th className="px-4 py-2">{t.adminCommon.status}</th>
                <th className="px-4 py-2">{t.adminCommon.actions}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <Fragment key={user.id}>
                <tr className="border-t border-slate-100 transition even:bg-slate-50/70 hover:bg-slate-100/80">
                  <td className="px-4 py-2">
                    {editingId === user.id ? (
                      <input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="rounded border border-slate-300 px-2 py-1"
                      />
                    ) : (
                      <span className="font-medium text-slate-800">{user.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-slate-500">
                    {editingId === user.id ? (
                      <input
                        value={editingEmail}
                        onChange={(e) => setEditingEmail(e.target.value)}
                        type="email"
                        className="rounded border border-slate-300 px-2 py-1"
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editingId === user.id ? (
                      <select
                        value={editingRole}
                        onChange={(e) => setEditingRole(e.target.value)}
                        className="rounded border border-slate-300 px-2 py-1"
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.name}>
                            {roleLabel(t, r.name)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      roleLabel(t, user.role)
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleToggleActive(user)}
                      className={`rounded-full px-2 py-1 text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}
                    >
                      {user.isActive ? t.usersPage.active : t.usersPage.disabled}
                    </button>
                  </td>
                  <td className="space-x-2 px-4 py-2 whitespace-nowrap">
                    {editingId === user.id ? (
                      <>
                        <button onClick={() => handleSaveEdit(user.id)} className="text-navy hover:underline">
                          {t.common.save}
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-slate-400 hover:underline">
                          {t.common.cancel}
                        </button>
                      </>
                    ) : (
                      <button onClick={() => startEdit(user)} className="text-navy hover:underline">
                        {t.common.edit}
                      </button>
                    )}
                    <button onClick={() => startReset(user.id)} className="text-navy hover:underline">
                      {t.usersPage.resetPassword}
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="text-accent hover:underline">
                      {t.common.delete}
                    </button>
                  </td>
                </tr>
                {resettingId === user.id && (
                  <tr className="border-t border-slate-100 bg-slate-50/70">
                    <td colSpan={5} className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="password"
                          autoFocus
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder={t.usersPage.newPasswordPlaceholder}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                        />
                        <button
                          onClick={() => handleResetPassword(user.id)}
                          disabled={resetting}
                          className="rounded-lg bg-navy px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          {resetting ? t.checkout.sending : t.usersPage.confirm}
                        </button>
                        <button onClick={() => setResettingId(null)} className="text-sm text-slate-400 hover:underline">
                          {t.common.cancel}
                        </button>
                        <span className="text-xs text-slate-400">{t.usersPage.revokesSession}</span>
                      </div>
                    </td>
                  </tr>
                )}
                {resetDoneId === user.id && (
                  <tr className="border-t border-slate-100">
                    <td colSpan={5} className="px-4 py-2 text-sm text-green-700">
                      {t.usersPage.passwordResetDone}
                    </td>
                  </tr>
                )}
                </Fragment>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    {t.usersPage.noAccounts}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
