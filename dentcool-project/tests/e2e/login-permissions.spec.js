import { expect, test } from '@playwright/test';

async function login(page, roleLabel, password) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('combobox').selectOption({ label: roleLabel });
  await page.getByPlaceholder('Ingresa la clave').fill(password);
  await page.getByRole('button', { name: 'Ingresar' }).click();
}

test('admin can enter and see management modules', async ({ page }) => {
  await login(page, 'Admin', 'admin123');

  await expect(page.getByRole('heading', { name: 'Seguimientos visibles' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Inventario', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reportes', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Facturacion', exact: true })).toBeVisible();
});

test('staff enters without internal finance or inventory access', async ({ page }) => {
  await login(page, 'Staff', 'staff123');

  await expect(page.getByRole('heading', { name: 'Seguimientos visibles' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Lista precios/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Inventario', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Reportes', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Facturacion', exact: true })).toHaveCount(0);
});
