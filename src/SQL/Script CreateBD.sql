CREATE SCHEMA biodiversidad;

CREATE TABLE biodiversidad.country(
	country_id SERIAL PRIMARY KEY,
	country_name VARCHAR(100)
);

CREATE TABLE biodiversidad.user (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    country_id INT REFERENCES biodiversidad.country(country_id),
    address TEXT,
    email VARCHAR(255) UNIQUE
);

CREATE TABLE biodiversidad.taxon(
	taxon_id SERIAL PRIMARY KEY,
    parent_id INT REFERENCES biodiversidad.taxon(taxon_id),
    rank TEXT NOT NULL,
    taxon_name TEXT NOT NULL,
    common_name TEXT,
    UNIQUE(rank, taxon_name)
);

CREATE TABLE biodiversidad.image (
    image_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES biodiversidad.user(user_id),
    taxon_id INT REFERENCES biodiversidad.taxon(taxon_id),
    date_img DATE,
    latitude_img DECIMAL(10,7),
    longitude_img DECIMAL(10,7),
    license TEXT,
	url TEXT,
    owner TEXT
);

CREATE TABLE biodiversidad.observation (
    observation_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES biodiversidad.user(user_id),
    taxon_id INT REFERENCES biodiversidad.taxon(taxon_id),
    image_id INT REFERENCES biodiversidad.image(image_id),
    date_obs DATE,
    latitude_obs DECIMAL(10,7),
    longitude_obs DECIMAL(10,7),
    note TEXT
);

CREATE TABLE biodiversidad.identification (
    identification_id SERIAL PRIMARY KEY,
    observation_id INT REFERENCES biodiversidad.observation(observation_id),
    taxon_id INT REFERENCES biodiversidad.taxon(taxon_id),
    user_id INT REFERENCES biodiversidad.user(user_id),
    date_identifi DATE
);