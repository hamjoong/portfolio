package com.projectx.auth.service;

import com.projectx.auth.domain.entity.OutboxEvent;
import com.projectx.auth.domain.entity.OutboxStatus;
import com.projectx.auth.domain.repository.OutboxRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OutboxProcessor {

    private final OutboxRepository outboxRepository;

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void processPendingEvents() {
        List<OutboxEvent> pendingEvents = outboxRepository.findTop10ByStatusOrderByCreatedAtAsc(OutboxStatus.INIT);

        for (OutboxEvent event : pendingEvents) {
            try {
                handleEvent(event);
                event.markAsProcessed();
            } catch (Exception e) {
                log.error("[Outbox] Failed to process event {}: {}", event.getId(), e.getMessage());
                event.markAsFailed();
            }
        }
    }

    private void handleEvent(OutboxEvent event) {
        if ("PAYMENT_REQUEST".equals(event.getEventType())) {
            String idempotencyKey = event.getAggregateId() + "_" + event.getId();
            log.info("[Outbox] Sending payment request. OrderId: {}, IdempotencyKey: {}", 
                     event.getAggregateId(), idempotencyKey);
        }
    }
}
