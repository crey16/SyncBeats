package java;

/**
 * Represents a user in a metronome room.
 * Stores basic user information like name.
 * 
 * Skills Demonstrated:
 * - Classes and Objects
 * - Instance Variables
 * - Constructors
 * - Getters and Setters
 * - toString Method Override
 * - String Methods
 * - Encapsulation
 */
public class User {
    private String name;

    /**
     * Creates a new user with the specified name.
     * @param name The user's name
     */
    public User(String name) {
        this.name = name;
    }

    /**
     * Gets the user's name.
     * @return The user's name
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the user's name.
     * @param name The new name
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Overrides the default toString method.
     * Skills:
     * - Method Overriding
     * - String Return
     */
    @Override
    public String toString() {
        return name;
    }
} 