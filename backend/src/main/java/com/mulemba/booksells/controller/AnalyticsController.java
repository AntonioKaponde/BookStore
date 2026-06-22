package com.mulemba.booksells.controller;

import com.mulemba.booksells.model.TrackingEvent;
import com.mulemba.booksells.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @PostMapping("/track")
    public ResponseEntity<Void> trackEvent(@RequestBody TrackingEvent event) {
        analyticsService.saveEvent(event);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/track/batch")
    public ResponseEntity<Void> trackEventsBatch(@RequestBody List<TrackingEvent> events) {
        analyticsService.saveEvents(events);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/heatmap")
    public ResponseEntity<List<TrackingEvent>> getHeatmapData(@RequestParam String pageUrl) {
        return ResponseEntity.ok(analyticsService.getHeatmapData(pageUrl));
    }

    @GetMapping("/funnel")
    public ResponseEntity<Map<String, Object>> getConversionFunnel() {
        return ResponseEntity.ok(analyticsService.getConversionFunnel());
    }
}
