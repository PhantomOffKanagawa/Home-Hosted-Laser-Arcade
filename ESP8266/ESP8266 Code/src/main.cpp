/*
 * IRremoteESP8266: IRrecvDump - dump details of IR codes with IRrecv
 * An IR detector/demodulator must be connected to the input RECV_PIN.
 * Version 0.1 Sept, 2015
 * Based on Ken Shirriff's IrsendDemo Version 0.1 July, 2009,
 * Copyright 2009 Ken Shirriff, http://arcfn.com
 * JVC and Panasonic protocol added by Kristian Lauszus
 *   (Thanks to zenwheel and other people at the original blog post)
 * LG added by Darryl Smith (based on the JVC protocol)
 */

#ifndef UNIT_TEST
#include <Arduino.h>
#endif

#include <IRremoteESP8266.h>
#include <IRrecv.h>
#include <IRutils.h>

#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>

int device = "00"; //2 digit code for the activated devices

int soloScore = 0;
int oneScore = 0;
int twoScore = 0;
int teamNum = 0;

// an IR detector/demodulator is connected to GPIO pin 2
uint16_t RECV_PIN = 13;
int val = 0;
int val2 = 0;
int val3 = 0;

IRrecv irrecv(RECV_PIN);

decode_results results;

void setup()
{
  Serial.begin(9600);
  irrecv.enableIRIn(); // Start the receiver

  WiFi.begin("WIFI NAME", "PASSWORD"); //WiFi connection

  while (WiFi.status() != WL_CONNECTED)
  { //Wait for the WiFI connection completion

    delay(500);
    Serial.println("Waiting for connection");
  }
}

void dump(decode_results *results)
{
  // Dumps out the decode_results structure.
  // Call this after IRrecv::decode()
  uint16_t count = results->rawlen;
  if (results->decode_type == UNKNOWN)
  {
    Serial.print("Unknown encoding: ");
  }
  else if (results->decode_type == NEC)
  {
    Serial.print("Decoded NEC: ");
  }
  else if (results->decode_type == SONY)
  {
    Serial.print("Decoded SONY: ");
  }
  else if (results->decode_type == RC5)
  {
    Serial.print("Decoded RC5: ");
  }
  else if (results->decode_type == RC5X)
  {
    Serial.print("Decoded RC5X: ");
  }
  else if (results->decode_type == RC6)
  {
    Serial.print("Decoded RC6: ");
  }
  else if (results->decode_type == RCMM)
  {
    Serial.print("Decoded RCMM: ");
  }
  else if (results->decode_type == PANASONIC)
  {
    Serial.print("Decoded PANASONIC - Address: ");
    Serial.print(results->address, HEX);
    Serial.print(" Value: ");
  }
  else if (results->decode_type == LG)
  {
    Serial.print("Decoded LG: ");
  }
  else if (results->decode_type == JVC)
  {
    Serial.print("Decoded JVC: ");
  }
  else if (results->decode_type == AIWA_RC_T501)
  {
    Serial.print("Decoded AIWA RC T501: ");
  }
  else if (results->decode_type == WHYNTER)
  {
    Serial.print("Decoded Whynter: ");
  }
  serialPrintUint64(results->value, 16);
  Serial.print(" (");
  Serial.print(results->bits, DEC);
  Serial.println(" bits)");
  Serial.print("Raw (");
  Serial.print(count, DEC);
  Serial.print("): ");

  for (uint16_t i = 1; i < count; i++)
  {
    if (i % 100 == 0)
      yield(); // Preemptive yield every 100th entry to feed the WDT.
    if (i & 1)
    {
      Serial.print(results->rawbuf[i] * RAWTICK, DEC);
    }
    else
    {
      Serial.write('-');
      Serial.print((uint32_t)results->rawbuf[i] * RAWTICK, DEC);
    }
    Serial.print(" ");
  }
  Serial.println();
}

void loop()
{
  if (WiFi.status() == WL_CONNECTED)
  { //Check WiFi connection status
    
  if (irrecv.decode(&results))
  {
    serialPrintUint64(results.value, 16);
    dump(&results);
    HTTPClient http; //Declare object of class HTTPClient
    
    http.addHeader("Content-Type", "text/plain"); //Specify content-type header

    if (results.value == 0xC74F590A)
    {
      soloScore++;
      http.begin("http://192.168.100.101:8080/receive?" + device + "0"); //Specify request destination
      Serial.println(soloScore);
    }
    else if (results.value == 0x1F582DCC)
    {
      oneScore++;
      http.begin("http://192.168.100.101:8080/receive?" + device + "1"); //Specify request destination
      Serial.println(oneScore);
    }
    else if (results.value == 0x7F2EF080)
    {
      twoScore++;
      http.begin("http://192.168.100.101:8080/receive?" + device + "2"); //Specify request destination
      Serial.println(twoScore);
    }

    int httpCode = http.GET(); //Send the request

    http.end(); //Close connection
    irrecv.resume(); // Receive the next value
 
}}}