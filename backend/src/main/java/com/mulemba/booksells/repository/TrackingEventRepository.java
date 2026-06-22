package com.mulemba.booksells.repository;

import com.mulemba.booksells.model.TrackingEvent;
import com.mulemba.booksells.model.enums.TrackingEventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TrackingEventRepository extends JpaRepository<TrackingEvent, UUID> {
    List<TrackingEvent> findByEventTypeAndTimestampAfter(TrackingEventType eventType, LocalDateTime timestamp);
    
    List<TrackingEvent> findByEventTypeAndPageUrlContaining(TrackingEventType eventType, String urlPath);
    
    @Query("SELECT e.pageUrl, COUNT(e) FROM TrackingEvent e WHERE e.eventType = 'PAGE_VIEW' GROUP BY e.pageUrl ORDER BY COUNT(e) DESC")
    List<Object[]> countPageViewsGroupedByUrl();
}
