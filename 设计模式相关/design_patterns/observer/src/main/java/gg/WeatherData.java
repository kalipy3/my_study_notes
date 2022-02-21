package gg;

import java.util.ArrayList;

public class WeatherData implements Subject {
    private float temp;
    private float humi;

    ArrayList observers;

    public WeatherData() {
        this.observers = new ArrayList<Observer>();
    }

    @Override
    public void registerObserver(Observer observer) {
        this.observers.add(observer);
    }

    @Override
    public void notifyObservers() {
        for (int i = 0; i < observers.size(); i++) {
            Observer observer = (Observer) observers.get(i);
            observer.update(temp, humi);
        }
    }

    @Override
    public void removeObserver(Observer observer) {
        int i = this.observers.indexOf(observer);
        if (i >= 0) {
            observers.remove(observer);
        }
    }

    public void setMeasurements(float temp, float humi) {
        this.temp = temp;
        this.humi = humi;

        measurementsChanged();
    }

    private void measurementsChanged() {
        notifyObservers();
    }
}
