package com.mulemba.booksells.model;

import com.mulemba.booksells.model.enums.TrackingEventType;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "tracking_events")
public class TrackingEvent {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TrackingEventType eventType;

    @Column(nullable = false)
    private String pageUrl;

    private Integer x;
    private Integer y;
    private Integer screenWidth;
    private Integer screenHeight;

    private String elementId;
    private String elementClass;

    private String sessionId;
    
    @Column(columnDefinition = "TEXT")
    private String additionalData;

    @CreationTimestamp
    private LocalDateTime timestamp;
}
