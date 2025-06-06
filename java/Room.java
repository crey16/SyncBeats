package java;

import java.util.ArrayList;

/**
 * Represents a room where users can join and use a metronome together.
 * Manages users and the room's metronome.
 * 
 * Skills Demonstrated:
 * - Classes and Objects
 * - ArrayList Usage
 * - Object Composition
 * - Boolean Expressions
 * - Object Methods
 * - Return Statements
 * - Object Creation
 * - Encapsulation
 */
public class Room {
    private String roomId;
    private ArrayList<User> users;
    private Metronome metronome;

    /**
     * Creates a new room with the specified ID and initial BPM.
     * @param roomId The room identifier
     * @param initialBPM The initial beats per minute
     */
    public Room(String roomId, int initialBPM) {
        this.roomId = roomId;
        this.users = new ArrayList<>();
        this.metronome = new Metronome(initialBPM, roomId);
    }

    /**
     * Adds a user to the room.
     * Skills:
     * - Boolean Expressions
     * - Object Methods
     * - ArrayList Methods
     * - Null Checking
     * @param user The user to add
     * @return true if the user was added successfully
     */
    public boolean addUser(User user) {
        if (user != null && !users.contains(user)) {
            users.add(user);
            return true;
        }
        return false;
    }

    /**
     * Removes a user from the room.
     * @param user The user to remove
     * @return true if the user was removed successfully
     */
    public boolean removeUser(User user) {
        return users.remove(user);
    }

    /**
     * Gets the list of users in the room.
     * Skills:
     * - ArrayList Methods
     * - Object Creation
     * - Return Statements
     * @return ArrayList of users
     */
    public ArrayList<User> getUsers() {
        return new ArrayList<>(users);
    }

    /**
     * Gets the room's metronome.
     * @return The room's metronome
     */
    public Metronome getMetronome() {
        return metronome;
    }

    /**
     * Gets the room ID.
     * @return The room identifier
     */
    public String getRoomId() {
        return roomId;
    }

    /**
     * Gets the number of users in the room.
     * @return The number of users
     */
    public int getUserCount() {
        return users.size();
    }

    /**
     * Cleans up resources when the room is no longer needed.
     */
    public void cleanup() {
        metronome.cleanup();
    }
} 