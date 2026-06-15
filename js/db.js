/* ═══════════════════════════════════════
   СЛОЙ БАЗЫ ДАННЫХ — Supabase
   ───────────────────────────────────────
   Как включить настоящую БД:
   1. Создай проект на https://supabase.com
   2. Вставь URL и anon-ключ ниже (Settings → API).
   3. Создай таблицы orders и bookings (SQL есть в README.md).

   Пока ключи пустые — приложение работает в локальном режиме
   (данные хранятся только в браузере, как раньше). Ничего не ломается.

   ⚠️ ФЗ-152: Supabase хранит данные за рубежом. Для боевого запуска
   с реальными СНИЛС используйте БД на территории РФ (Yandex Cloud,
   VK Cloud или собственный Supabase на российском VPS) — поменяется
   только SUPABASE_URL ниже.
═══════════════════════════════════════ */
(function () {
  "use strict";

  const CONFIG = {
    SUPABASE_URL: "",       // ← сюда вставить URL проекта
    SUPABASE_ANON_KEY: ""   // ← сюда вставить anon public key
  };

  const SDK_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

  let clientPromise = null;
  const isConfigured = () => !!(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY);

  // Лениво подгружаем клиент только если БД настроена
  function getClient() {
    if (!isConfigured()) return Promise.resolve(null);
    if (!clientPromise) {
      clientPromise = import(SDK_URL)
        .then(({ createClient }) =>
          createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY)
        )
        .catch((e) => {
          console.warn("[GarmoniyaDB] Не удалось загрузить Supabase SDK:", e);
          return null;
        });
    }
    return clientPromise;
  }

  async function insert(table, row) {
    // Возвращаем {ok, remote}: remote=true если реально записали в БД.
    try {
      const client = await getClient();
      if (!client) return { ok: true, remote: false }; // локальный режим
      const { error } = await client.from(table).insert(row);
      if (error) {
        console.warn(`[GarmoniyaDB] Ошибка записи в ${table}:`, error.message);
        return { ok: true, remote: false };
      }
      return { ok: true, remote: true };
    } catch (e) {
      console.warn(`[GarmoniyaDB] Сбой при записи в ${table}:`, e);
      return { ok: true, remote: false }; // не роняем UX — есть localStorage
    }
  }

  window.GarmoniyaDB = {
    isConfigured,
    saveOrder(order) {
      return insert("orders", {
        client_name: order.clientName || null,
        client_phone: order.clientPhone || null,
        city: order.cityName || null,
        moroshka: !!order.moroshka,
        total: order.total || 0,
        items: order.items || [],
        created_at: new Date().toISOString()
      });
    },
    saveBooking(b) {
      return insert("bookings", {
        ticket: b.num || null,
        client_name: b.clientName || null,
        client_phone: b.clientPhone || null,
        city: b.cityName || null,
        department: b.dept || null,
        specialist: b.spec || null,
        visit_date: b.visitDate || null,
        visit_time: b.visitTime || null,
        comment: b.comment || "",
        created_at: new Date().toISOString()
      });
    }
  };
})();
