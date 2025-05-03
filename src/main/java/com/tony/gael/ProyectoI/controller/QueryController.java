package com.tony.gael.ProyectoI.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/query")
public class QueryController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping
    public List<Map<String, Object>> executeQuery(@RequestBody QueryRequest request) {
        return jdbcTemplate.queryForList(request.getQuery());
    }

    public static class QueryRequest {
        private String query;

        // Getter y Setter
        public String getQuery() {
            return query;
        }

        public void setQuery(String query) {
            this.query = query;
        }
    }
}