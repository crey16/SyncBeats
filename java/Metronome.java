package java;

import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Represents a metronome that can play ticks at a specified BPM.
 * Handles timing, ticking, and logging functionality.
 * 
 * Skills Demonstrated:
 * - Classes and Objects (Instance variables, Methods, Constructors)
 * - Primitive Data Types (int, boolean)
 * - Object Data Types (String, PrintWriter)
 * - While Loops
 * - Boolean Expressions and If Statements
 * - String Methods and Concatenation
 * - File I/O Operations
 * - Thread.sleep for timing
 * - Exception Handling
 */
public class Metronome {
    private int bpm;
    private boolean isRunning;
    private int tickCount;
    private String roomId;
    private PrintWriter logWriter;

    /**
     * Creates a new metronome with the specified BPM and room ID.
     * @param bpm The beats per minute
     * @param roomId The room identifier
     */
    public Metronome(int bpm, String roomId) {
        this.bpm = bpm;
        this.roomId = roomId;
        this.isRunning = false;
        this.tickCount = 0;
        
        // Initialize log file
        try {
            this.logWriter = new PrintWriter(new FileWriter("metronome_log.txt", true));
        } catch (IOException e) {
            System.err.println("Error creating log file: " + e.getMessage());
        }
    }

    /**
     * Starts the metronome ticking.
     */
    public void start() {
        if (!isRunning) {
            isRunning = true;
            tickCount = 0;
            tick();
        }
    }

    /**
     * Stops the metronome.
     */
    public void stop() {
        isRunning = false;
    }

    /**
     * Sets the BPM of the metronome.
     * @param bpm The new beats per minute
     */
    public void setBPM(int bpm) {
        if (bpm > 0) {
            this.bpm = bpm;
        }
    }

    /**
     * Gets the current BPM.
     * @return The current beats per minute
     */
    public int getBPM() {
        return bpm;
    }

    /**
     * The main ticking loop that runs while the metronome is active.
     * Skills:
     * - While Loops
     * - Thread.sleep
     * - String Formatting
     * - Exception Handling
     */
    private void tick() {
        while (isRunning) {
            try {
                // Calculate delay based on BPM
                long delay = (long) (60000.0 / bpm);
                Thread.sleep(delay);
                
                // Increment tick count and log the tick
                tickCount++;
                String message = String.format("[Room %s] Tick #%d at BPM %d", roomId, tickCount, bpm);
                System.out.println(message);
                
                // Log to file if writer is available
                if (logWriter != null) {
                    String timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                    logWriter.println(timestamp + " - " + message);
                    logWriter.flush();
                }
            } catch (InterruptedException e) {
                System.err.println("Metronome interrupted: " + e.getMessage());
                isRunning = false;
            }
        }
    }

    /**
     * Closes the log writer when the metronome is no longer needed.
     * Skills:
     * - Object Methods
     * - Null Checking
     */
    public void cleanup() {
        if (logWriter != null) {
            logWriter.close();
        }
    }
} 