package gg;

public class CurrentConditionsDisplay implements Observer, DisplayElement {
    private float temp;
    private float humi;

    private Subject weatherData;

    public CurrentConditionsDisplay(Subject weatherData) {
        this.weatherData = weatherData;
        weatherData.registerObserver(this);
    }

    @Override
    public void display() {
        System.out.println("temp:" + temp + "\r\n" + "humi:" + humi);
    }

    @Override
    public void update(float temp, float humi) {
        this.temp = temp;
        this.humi = humi;
        display();
    }
}
