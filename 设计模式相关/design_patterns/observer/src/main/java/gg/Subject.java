package gg;

public interface Subject {
    public void registerObserver(Observer observer);
    public void notifyObservers();
    public void removeObserver(Observer observer);
}
