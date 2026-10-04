-- Runs once when the local Postgres volume is first created.
-- Separate database for tests so they never touch development data.
CREATE DATABASE app_test OWNER app;
