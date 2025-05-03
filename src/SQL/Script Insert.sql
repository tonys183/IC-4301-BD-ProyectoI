INSERT INTO biodiversidad.country (country_name) VALUES ('Costa Rica'), ('Panamá'), ('Nicaragua');

INSERT INTO biodiversidad.user (first_name, last_name, country_id, address, email) VALUES
('Tony', 'Segura', 1, '200 metros norte de maxi pali', 'tonyss@gmail.com'),
('María', 'Mora', 1, 'Avenida Central, San José', 'mariamora@email.com'),
('Gael', 'Ruiz', 3, 'Managua', 'gaelrr@gmail.com'),
('Sebas', 'Castilla', 3, 'León, cerca de la catedral', 'guegue@gmail.com'),
('Saúl', 'Pacheco', 2, 'Calle 50, Panamá', 'saulls@gmail.com'),
('Fiorella', 'Gonzáles', 2, 'Vía España', 'fiogo@gmail.com');

CREATE OR REPLACE FUNCTION biodiversidad.insertar_jerarquia_taxonomica(p_domain TEXT,p_kingdom TEXT,p_phylum TEXT,p_class TEXT,p_order TEXT,p_family TEXT,p_genus TEXT,p_species TEXT,p_common_name TEXT DEFAULT NULL) RETURNS INT AS
$$
DECLARE
    v_domain_id INT;
    v_kingdom_id INT;
    v_phylum_id INT;
    v_class_id INT;
    v_order_id INT;
    v_family_id INT;
    v_genus_id INT;
    v_species_id INT;
BEGIN
    INSERT INTO biodiversidad.taxon (parent_id, rank, taxon_name)
    VALUES (NULL, 'domain', p_domain)
    ON CONFLICT (rank, taxon_name) DO NOTHING
    RETURNING taxon_id INTO v_domain_id;
    IF v_domain_id IS NULL THEN
        SELECT taxon_id INTO v_domain_id
        FROM biodiversidad.taxon
        WHERE rank = 'domain' AND taxon_name = p_domain;
    END IF;

    INSERT INTO biodiversidad.taxon (parent_id, rank, taxon_name)
    VALUES (v_domain_id, 'kingdom', p_kingdom)
    ON CONFLICT (rank, taxon_name) DO NOTHING
    RETURNING taxon_id INTO v_kingdom_id;
    IF v_kingdom_id IS NULL THEN
        SELECT taxon_id INTO v_kingdom_id
        FROM biodiversidad.taxon
        WHERE rank = 'kingdom' AND taxon_name = p_kingdom AND parent_id = v_domain_id;
    END IF;

    INSERT INTO biodiversidad.taxon (parent_id, rank, taxon_name)
    VALUES (v_kingdom_id, 'phylum', p_phylum)
    ON CONFLICT (rank, taxon_name) DO NOTHING
    RETURNING taxon_id INTO v_phylum_id;
    IF v_phylum_id IS NULL THEN
        SELECT taxon_id INTO v_phylum_id
        FROM biodiversidad.taxon
        WHERE rank = 'phylum' AND taxon_name = p_phylum AND parent_id = v_kingdom_id;
    END IF;

    INSERT INTO biodiversidad.taxon (parent_id, rank, taxon_name)
    VALUES (v_phylum_id, 'class', p_class)
    ON CONFLICT (rank, taxon_name) DO NOTHING
    RETURNING taxon_id INTO v_class_id;
    IF v_class_id IS NULL THEN
        SELECT taxon_id INTO v_class_id
        FROM biodiversidad.taxon
        WHERE rank = 'class' AND taxon_name = p_class AND parent_id = v_phylum_id;
    END IF;

    INSERT INTO biodiversidad.taxon (parent_id, rank, taxon_name)
    VALUES (v_class_id, 'order', p_order)
    ON CONFLICT (rank, taxon_name) DO NOTHING
    RETURNING taxon_id INTO v_order_id;
    IF v_order_id IS NULL THEN
        SELECT taxon_id INTO v_order_id
        FROM biodiversidad.taxon
        WHERE rank = 'order' AND taxon_name = p_order AND parent_id = v_class_id;
    END IF;

    INSERT INTO biodiversidad.taxon (parent_id, rank, taxon_name)
    VALUES (v_order_id, 'family', p_family)
    ON CONFLICT (rank, taxon_name) DO NOTHING
    RETURNING taxon_id INTO v_family_id;
    IF v_family_id IS NULL THEN
        SELECT taxon_id INTO v_family_id
        FROM biodiversidad.taxon
        WHERE rank = 'family' AND taxon_name = p_family AND parent_id = v_order_id;
    END IF;

    INSERT INTO biodiversidad.taxon (parent_id, rank, taxon_name)
    VALUES (v_family_id, 'genus', p_genus)
    ON CONFLICT (rank, taxon_name) DO NOTHING
    RETURNING taxon_id INTO v_genus_id;
    IF v_genus_id IS NULL THEN
        SELECT taxon_id INTO v_genus_id
        FROM biodiversidad.taxon
        WHERE rank = 'genus' AND taxon_name = p_genus AND parent_id = v_family_id;
    END IF;

    INSERT INTO biodiversidad.taxon (parent_id, rank, taxon_name, common_name)
    VALUES (v_genus_id, 'species', p_species, p_common_name)
    ON CONFLICT (rank, taxon_name) DO NOTHING
    RETURNING taxon_id INTO v_species_id;
    IF v_species_id IS NULL THEN
        SELECT taxon_id INTO v_species_id
        FROM biodiversidad.taxon
        WHERE rank = 'species' AND taxon_name = p_species AND parent_id = v_genus_id;
    END IF;

    RETURN v_species_id;
END;
$$ LANGUAGE plpgsql;

-- Mamíferos
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Animalia', 'Chordata', 'Mammalia', 'Carnivora', 'Felidae', 'Panthera', 'Panthera leo', 'León');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Animalia', 'Chordata', 'Mammalia', 'Carnivora', 'Felidae', 'Panthera', 'Panthera tigris', 'Tigre');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Animalia', 'Chordata', 'Mammalia', 'Carnivora', 'Canidae', 'Canis', 'Canis lupus', 'Lobo');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Animalia', 'Chordata', 'Mammalia', 'Carnivora', 'Ursidae', 'Ursus', 'Ursus arctos', 'Oso pardo');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Animalia', 'Chordata', 'Mammalia', 'Primates', 'Hominidae', 'Homo', 'Homo sapiens', 'Humano');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Animalia', 'Chordata', 'Mammalia', 'Proboscidea', 'Elephantidae', 'Elephas', 'Elephas maximus', 'Elefante asiático');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Animalia', 'Chordata', 'Mammalia', 'Cetacea', 'Delphinidae', 'Delphinus', 'Delphinus delphis', 'Delfín común');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Animalia', 'Chordata', 'Mammalia', 'Rodentia', 'Muridae', 'Mus', 'Mus musculus', 'Ratón doméstico');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Animalia', 'Chordata', 'Mammalia', 'Artiodactyla', 'Giraffidae', 'Giraffa', 'Giraffa camelopardalis', 'Jirafa');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Animalia', 'Chordata', 'Mammalia', 'Chiroptera', 'Vespertilionidae', 'Myotis', 'Myotis lucifugus', 'Murciélago pequeño de color café');

-- Aves
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Animalia', 'Chordata', 'Aves', 'Passeriformes', 'Turdidae', 'Turdus', 'Turdus merula', 'Mirlo común');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Animalia', 'Chordata', 'Aves', 'Passeriformes', 'Corvidae', 'Corvus', 'Corvus corax', 'Cuervo común');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Animalia', 'Chordata', 'Aves', 'Accipitriformes', 'Accipitridae', 'Aquila', 'Aquila chrysaetos', 'Águila real');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Animalia', 'Chordata', 'Aves', 'Strigiformes', 'Strigidae', 'Bubo', 'Bubo bubo', 'Búho real');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Animalia', 'Chordata', 'Aves', 'Columbiformes', 'Columbidae', 'Columba', 'Columba livia', 'Paloma doméstica');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Animalia', 'Chordata', 'Aves', 'Galliformes', 'Phasianidae', 'Gallus', 'Gallus gallus', 'Gallo doméstico');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Animalia', 'Chordata', 'Aves', 'Sphenisciformes', 'Spheniscidae', 'Aptenodytes', 'Aptenodytes forsteri', 'Pingüino emperador');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Animalia', 'Chordata', 'Aves', 'Psittaciformes', 'Psittacidae', 'Ara', 'Ara macao', 'Guacamayo rojo');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Animalia', 'Chordata', 'Aves', 'Anseriformes', 'Anatidae', 'Anas', 'Anas platyrhynchos', 'Pato real');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Animalia', 'Chordata', 'Aves', 'Falconiformes', 'Falconidae', 'Falco', 'Falco peregrinus', 'Halcón peregrino');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Animalia', 'Chordata', 'Aves', 'Passeriformes', 'Cardinalidae', 'Cardinalis', 'Cardinalis cardinalis', 'Cardenal norteño');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Animalia', 'Chordata', 'Aves', 'Passeriformes', 'Corvidae', 'Cyanocitta', 'Cyanocitta cristata', 'Arrendajo azul');

-- Plantas
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Plantae', 'Tracheophyta', 'Magnoliopsida', 'Rosales', 'Rosaceae', 'Rosa', 'Rosa canina', 'Rosa silvestre');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Plantae', 'Tracheophyta', 'Magnoliopsida', 'Fagales', 'Fagaceae', 'Quercus', 'Quercus robur', 'Roble común');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Plantae', 'Tracheophyta', 'Magnoliopsida', 'Lamiales', 'Oleaceae', 'Olea', 'Olea europaea', 'Olivo');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Plantae', 'Tracheophyta', 'Magnoliopsida', 'Sapindales', 'Rutaceae', 'Citrus', 'Citrus × sinensis', 'Naranjo');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Plantae', 'Tracheophyta', 'Magnoliopsida', 'Malpighiales', 'Salicaceae', 'Populus', 'Populus nigra', 'Álamo negro');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Plantae', 'Tracheophyta', 'Magnoliopsida', 'Fabales', 'Fabaceae', 'Phaseolus', 'Phaseolus vulgaris', 'Frijol común');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Plantae', 'Tracheophyta', 'Liliopsida', 'Poales', 'Poaceae', 'Triticum', 'Triticum aestivum', 'Trigo común');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Plantae', 'Tracheophyta', 'Liliopsida', 'Asparagales', 'Orchidaceae', 'Vanilla', 'Vanilla planifolia', 'Vainilla');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Plantae', 'Tracheophyta', 'Pinopsida', 'Pinales', 'Pinaceae', 'Pinus', 'Pinus sylvestris', 'Pino silvestre');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Eukarya', 'Plantae', 'Bryophyta', 'Bryopsida', 'Hypnales', 'Hypnaceae', 'Hypnum', 'Hypnum cupressiforme', 'Musgo ciprés');

-- Bacterias
SELECT biodiversidad.insertar_jerarquia_taxonomica('Bacteria', 'Proteobacteria', 'Gammaproteobacteria', 'Enterobacterales', 'Enterobacteriaceae', 'Escherichia', 'Escherichia coli', 'E. coli');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Bacteria', 'Firmicutes', 'Bacilli', 'Bacillales', 'Staphylococcaceae', 'Staphylococcus', 'Staphylococcus aureus', 'Estafilococo áureo');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Bacteria', 'Actinobacteria', 'Actinobacteria', 'Actinomycetales', 'Streptomycetaceae', 'Streptomyces', 'Streptomyces griseus', 'Estreptomiceto');
SELECT biodiversidad.insertar_jerarquia_taxonomica('Bacteria', 'Cyanobacteria', 'Cyanophyceae', 'Synechococcales', 'Synechococcaceae', 'Synechococcus', 'Synechococcus elongatus', 'Cianobacteria marina');

-- Archaea
SELECT biodiversidad.insertar_jerarquia_taxonomica('Archaea', 'Euryarchaeota', 'Halobacteria', 'Halobacteriales', 'Halobacteriaceae', 'Halobacterium', 'Halobacterium salinarum', 'Halófilo extremo');