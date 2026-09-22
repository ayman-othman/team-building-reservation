import { Component, ChangeDetectionStrategy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-countdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="countdown-container">
      <p class="countdown-title">Reservation Deadline</p>
      <div class="countdown-grid">
        <div class="countdown-box">
          <div class="countdown-value">{{ days() }}</div>
          <div class="countdown-label">Days</div>
        </div>

        <div class="countdown-separator">:</div>

        <div class="countdown-box">
          <div class="countdown-value">{{ hours() }}</div>
          <div class="countdown-label">Hours</div>
        </div>

        <div class="countdown-separator">:</div>

        <div class="countdown-box">
          <div class="countdown-value">{{ minutes() }}</div>
          <div class="countdown-label">Minutes</div>
        </div>

        <div class="countdown-separator">:</div>

        <div class="countdown-box">
          <div class="countdown-value">{{ seconds() }}</div>
          <div class="countdown-label">Seconds</div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .countdown-container {
        margin: 2rem 0;
        padding: 2rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
      }

      .countdown-title {
        text-align: center;
        font-size: 0.875rem;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0 0 1.5rem 0;
      }

      .countdown-grid {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        flex-wrap: nowrap;
      }

      .countdown-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        min-width: 4.5rem;
        padding: 1.25rem 1rem;
        background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
        border: 2px solid #dc143c;
        border-radius: 0.5rem;
        flex: 1;
      }

      .countdown-value {
        font-size: 2.25rem;
        font-weight: 800;
        color: #dc143c;
        line-height: 1;
        font-variant-numeric: tabular-nums;
      }

      .countdown-label {
        font-size: 0.65rem;
        color: #7f1d1d;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }

      .countdown-separator {
        font-size: 2rem;
        font-weight: 700;
        color: #dc143c;
        line-height: 1;
        padding-bottom: 1.5rem;
        opacity: 0.6;
        flex-shrink: 0;
      }

      @media (max-width: 768px) {
        .countdown-container {
          padding: 1.5rem 1rem;
        }

        .countdown-grid {
          gap: 0.5rem;
        }

        .countdown-box {
          padding: 0.875rem 0.5rem;
          min-width: 0;
        }

        .countdown-value {
          font-size: 1.875rem;
        }

        .countdown-separator {
          font-size: 1.5rem;
          padding-bottom: 1rem;
          margin: 0 0.25rem;
        }
      }

      @media (max-width: 480px) {
        .countdown-container {
          padding: 1rem 0.5rem;
        }

        .countdown-title {
          font-size: 0.75rem;
          margin-bottom: 1rem;
        }

        .countdown-grid {
          gap: 0.3rem;
        }

        .countdown-box {
          padding: 0.65rem 0.35rem;
          min-width: 0;
          flex: 1;
        }

        .countdown-value {
          font-size: 1.375rem;
        }

        .countdown-label {
          font-size: 0.55rem;
        }

        .countdown-separator {
          font-size: 1rem;
          padding-bottom: 0.5rem;
          margin: 0 0.15rem;
          opacity: 0.5;
        }
      }
    `,
  ],
})
export class CountdownComponent {
  days = signal(0);
  hours = signal(0);
  minutes = signal(0);
  seconds = signal(0);

  constructor() {
    this.updateCountdown();
    setInterval(() => this.updateCountdown(), 1000);
  }

  private updateCountdown(): void {
    const targetDate = new Date('2026-09-22T23:59:59').getTime();
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference > 0) {
      this.days.set(Math.floor(difference / (1000 * 60 * 60 * 24)));
      this.hours.set(Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
      this.minutes.set(Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)));
      this.seconds.set(Math.floor((difference % (1000 * 60)) / 1000));
    } else {
      this.days.set(0);
      this.hours.set(0);
      this.minutes.set(0);
      this.seconds.set(0);
    }
  }
}
