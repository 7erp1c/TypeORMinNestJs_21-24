/*
  1. Чтобы генерить по default uuid: CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  в default: uuid_generate_v4()
 *
  2. Чтобы генерить нужный формат даты(это установит default значение):
  ALTER TABLE "таблица"
    ALTER COLUMN  "колонка"
      SET DEFAULT  (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'));

  3. Чтобы сортировка работала правильно:
   columns/"твоя колонка"/редактировать/properties/definitions/collations/"C"

  4. Замена типа:
  ALTER TABLE "Users"
ALTER COLUMN "email" TYPE uuid USING "email"::character varying;

  5. Устанавливаем деф разрешения уже созданным:
   GRANT ALL PRIVILEGES ON TABLES IN SCHEMA public TO postgres;
 */
