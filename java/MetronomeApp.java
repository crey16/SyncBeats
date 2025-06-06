package java;

import java.util.ArrayList;
import java.util.Scanner;

/**
 * Main application class for the metronome simulation.
 * Handles user interaction and room management.
 * 
 * Skills Demonstrated:
 * - Classes and Objects
 * - ArrayList Usage
 * - Scanner for User Input
 * - While Loops
 * - Switch Statements
 * - Boolean Expressions
 * - String Methods
 * - Exception Handling
 * - Object Creation and Management
 * - Method Overloading
 * - Console I/O
 */
public class MetronomeApp {
    private static ArrayList<Room> rooms = new ArrayList<>();
    private static Scanner scanner = new Scanner(System.in);

    public static void main(String[] args) {
        boolean running = true;
        
        while (running) {
            System.out.println("\n=== Metronome App ===");
            System.out.println("1. Create a new room");
            System.out.println("2. Join a room");
            System.out.println("3. List all rooms");
            System.out.println("4. Exit");
            System.out.print("Choose an option: ");
            
            int choice = getIntInput();
            
            switch (choice) {
                case 1:
                    createRoom();
                    break;
                case 2:
                    joinRoom();
                    break;
                case 3:
                    listRooms();
                    break;
                case 4:
                    running = false;
                    cleanup();
                    break;
                default:
                    System.out.println("Invalid option. Please try again.");
            }
        }
        
        scanner.close();
    }

    private static void createRoom() {
        System.out.print("Enter room ID: ");
        String roomId = scanner.nextLine();
        
        System.out.print("Enter initial BPM: ");
        int bpm = getIntInput();
        
        Room room = new Room(roomId, bpm);
        rooms.add(room);
        
        System.out.println("Room created successfully!");
        manageRoom(room);
    }

    private static void joinRoom() {
        if (rooms.isEmpty()) {
            System.out.println("No rooms available.");
            return;
        }

        listRooms();
        System.out.print("Enter room ID to join: ");
        String roomId = scanner.nextLine();
        
        Room room = findRoom(roomId);
        if (room != null) {
            manageRoom(room);
        } else {
            System.out.println("Room not found.");
        }
    }

    /**
     * Manages a room's operations and user interactions.
     * Skills:
     * - While Loops
     * - Switch Statements
     * - Object Methods
     * - Boolean Expressions
     * - Console I/O
     */
    private static void manageRoom(Room room) {
        boolean inRoom = true;
        
        while (inRoom) {
            System.out.println("\n=== Room: " + room.getRoomId() + " ===");
            System.out.println("Current BPM: " + room.getMetronome().getBPM());
            System.out.println("Users in room: " + room.getUserCount());
            System.out.println("1. Add user");
            System.out.println("2. Remove user");
            System.out.println("3. Start metronome");
            System.out.println("4. Stop metronome");
            System.out.println("5. Change BPM");
            System.out.println("6. Leave room");
            System.out.print("Choose an option: ");
            
            int choice = getIntInput();
            
            switch (choice) {
                case 1:
                    addUser(room);
                    break;
                case 2:
                    removeUser(room);
                    break;
                case 3:
                    room.getMetronome().start();
                    break;
                case 4:
                    room.getMetronome().stop();
                    break;
                case 5:
                    changeBPM(room);
                    break;
                case 6:
                    inRoom = false;
                    break;
                default:
                    System.out.println("Invalid option. Please try again.");
            }
        }
    }

    private static void addUser(Room room) {
        System.out.print("Enter user name: ");
        String name = scanner.nextLine();
        User user = new User(name);
        
        if (room.addUser(user)) {
            System.out.println("User added successfully!");
        } else {
            System.out.println("Failed to add user.");
        }
    }

    private static void removeUser(Room room) {
        ArrayList<User> users = room.getUsers();
        if (users.isEmpty()) {
            System.out.println("No users in room.");
            return;
        }

        System.out.println("Users in room:");
        for (int i = 0; i < users.size(); i++) {
            System.out.println((i + 1) + ". " + users.get(i).getName());
        }

        System.out.print("Enter user number to remove: ");
        int choice = getIntInput();
        
        if (choice > 0 && choice <= users.size()) {
            User user = users.get(choice - 1);
            if (room.removeUser(user)) {
                System.out.println("User removed successfully!");
            } else {
                System.out.println("Failed to remove user.");
            }
        } else {
            System.out.println("Invalid user number.");
        }
    }

    private static void changeBPM(Room room) {
        System.out.print("Enter new BPM: ");
        int newBPM = getIntInput();
        room.getMetronome().setBPM(newBPM);
        System.out.println("BPM updated to: " + newBPM);
    }

    private static void listRooms() {
        if (rooms.isEmpty()) {
            System.out.println("No rooms available.");
            return;
        }

        System.out.println("\nAvailable Rooms:");
        for (Room room : rooms) {
            System.out.println("Room: " + room.getRoomId() + 
                             " (BPM: " + room.getMetronome().getBPM() + 
                             ", Users: " + room.getUserCount() + ")");
        }
    }

    private static Room findRoom(String roomId) {
        for (Room room : rooms) {
            if (room.getRoomId().equals(roomId)) {
                return room;
            }
        }
        return null;
    }

    /**
     * Gets integer input from the user with error handling.
     * Skills:
     * - Exception Handling
     * - While Loops
     * - Boolean Expressions
     * - Type Conversion
     */
    private static int getIntInput() {
        while (true) {
            try {
                String input = scanner.nextLine();
                return Integer.parseInt(input);
            } catch (NumberFormatException e) {
                System.out.print("Please enter a valid number: ");
            }
        }
    }

    private static void cleanup() {
        for (Room room : rooms) {
            room.cleanup();
        }
    }
} 