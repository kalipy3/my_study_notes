package gg;

import org.omg.Messaging.SyncScopeHelper;

import java.io.DataInput;

public class Test {
    public static void main(String[] args) {
        WeatherData weatherData = new WeatherData();
        Observer observer = new CurrentConditionsDisplay(weatherData);

        weatherData.setMeasurements(12, 27);

        weatherData.removeObserver(observer);
        weatherData.setMeasurements(15, 18);
    }
}
