package com.mulemba.booksells.service;

import com.mulemba.booksells.model.TrackingEvent;
import com.mulemba.booksells.model.enums.TrackingEventType;
import com.mulemba.booksells.repository.TrackingEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TrackingEventRepository repository;

    public TrackingEvent saveEvent(TrackingEvent event) {
        return repository.save(event);
    }

    public List<TrackingEvent> saveEvents(List<TrackingEvent> events) {
        return repository.saveAll(events);
    }

    public List<TrackingEvent> getHeatmapData(String pageUrl) {
        return repository.findByEventTypeAndPageUrlContaining(TrackingEventType.CLICK, pageUrl);
    }

    public Map<String, Object> getConversionFunnel() {
        LocalDateTime last30Days = LocalDateTime.now().minusDays(30);
        
        long visits = repository.findByEventTypeAndTimestampAfter(TrackingEventType.PAGE_VIEW, last30Days).size();
        long cartAdds = repository.findByEventTypeAndTimestampAfter(TrackingEventType.ADD_TO_CART, last30Days).size();
        long checkouts = repository.findByEventTypeAndTimestampAfter(TrackingEventType.CHECKOUT_COMPLETE, last30Days).size();

        Map<String, Object> funnel = new HashMap<>();
        funnel.put("visits", visits);
        funnel.put("cartAdds", cartAdds);
        funnel.put("checkouts", checkouts);
        
        double cartRate = visits > 0 ? ((double) cartAdds / visits) * 100 : 0;
        double checkoutRate = visits > 0 ? ((double) checkouts / visits) * 100 : 0;
        
        funnel.put("cartConversionRate", Math.round(cartRate * 10.0) / 10.0);
        funnel.put("checkoutConversionRate", Math.round(checkoutRate * 10.0) / 10.0);

        return funnel;
    }
}
