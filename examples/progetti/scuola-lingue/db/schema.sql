-- Schema di «Parla Subito» (Postgres 16)

CREATE TABLE users (
  id            serial PRIMARY KEY,
  email         text NOT NULL UNIQUE,
  password_hash text NOT NULL,              -- argon2id
  role          text NOT NULL CHECK (role IN ('student', 'parent', 'teacher', 'support', 'admin')),
  newsletter    boolean NOT NULL DEFAULT false,
  marketing_consent boolean NOT NULL DEFAULT false,
  marketing_consent_at timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

CREATE TABLE students (
  id             serial PRIMARY KEY,
  user_id        int NOT NULL REFERENCES users(id),
  parent_id      int REFERENCES users(id),
  nome           text NOT NULL,
  cognome        text NOT NULL,
  data_nascita   date NOT NULL,
  luogo_nascita  text,
  codice_fiscale text,
  telefono       text,
  livello        text,
  note_salute    text,                       -- facoltative, per gli insegnanti
  school_id      int NOT NULL
);

CREATE TABLE payers (
  id             serial PRIMARY KEY,
  user_id        int NOT NULL REFERENCES users(id),
  nome           text NOT NULL,
  cognome        text NOT NULL,
  codice_fiscale text NOT NULL,              -- per la fattura
  indirizzo      text NOT NULL,
  documento_key  text                        -- scansione del documento (storage, cifrata)
);

CREATE TABLE classes (
  id         serial PRIMARY KEY,
  school_id  int NOT NULL,
  teacher_id int NOT NULL REFERENCES users(id),
  nome       text NOT NULL
);

CREATE TABLE enrollments (
  student_id int NOT NULL REFERENCES students(id),
  class_id   int NOT NULL REFERENCES classes(id),
  PRIMARY KEY (student_id, class_id)
);

CREATE TABLE bookings (
  id         serial PRIMARY KEY,
  student_id int NOT NULL REFERENCES students(id),
  lesson_at  timestamptz NOT NULL,
  presente   boolean
);

CREATE TABLE invoices (
  id        serial PRIMARY KEY,
  payer_id  int NOT NULL REFERENCES payers(id),
  numero    text NOT NULL UNIQUE,
  importo   numeric(10,2) NOT NULL,
  emessa_il date NOT NULL
);

CREATE TABLE recordings (
  id          serial PRIMARY KEY,
  class_id    int NOT NULL REFERENCES classes(id),
  storage_key text NOT NULL,
  transcript  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE messages (
  id         serial PRIMARY KEY,
  user_id    int NOT NULL REFERENCES users(id),
  testo      text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_log (
  id         bigserial PRIMARY KEY,
  actor_id   int NOT NULL,
  action     text NOT NULL,
  target     text,
  at         timestamptz NOT NULL DEFAULT now()
);
