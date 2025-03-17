import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea";
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation";
// import logger from "@/lib/docs/logger";

const formSchema = z.object({
    NameQuery: z.string().min(1, "NameQuery is required"),
    DescriptionQuery: z.string().min(1, "DescriptionQuery is required"),
    IntervaleQuery: z.number().optional(),
    IdSite: z.string().uuid().or(z.literal('')).optional(),
    SiteName: z.string().optional(),
    CapteurName: z.string().optional(),
    CapteurTypeName: z.string().optional(),
    Module: z.string().optional(),
    Type: z.string().optional(),
    Model: z.string().optional(),
    TimeStart: z.string().datetime().or(z.literal('')).optional(),
    TimeEnd: z.string().datetime().or(z.literal('')).optional()
});

const QueryForm = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            NameQuery: '',
            DescriptionQuery: '',
            IntervaleQuery: 0,
            IdSite: '',
            SiteName: '',
            CapteurName: '',
            CapteurTypeName: '',
            Module: '',
            Type: '',
            Model: '',
            TimeStart: '',
            TimeEnd: ''
        }
    });

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [date, setDate] = useState<DateRange | undefined>(undefined);
    const [open, setOpen] = useState(false);
    const router = useRouter()

    useEffect(() => {
        // logger.logWithErrorHandling('Error in query form:', form.formState.errors);
    }, [form.formState.errors]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [form.watch()]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        // logger.debug(`Form values: ${JSON.stringify(values)}`); 
        // Filter out empty values
        const filteredValues = Object.fromEntries(
            Object.entries(values).filter(([_, value]) => value !== '')
        );
        
        // logger.debug(`Filtered values: ${JSON.stringify(filteredValues)}`);
        // auto copy json to clipboard
        navigator.clipboard.writeText(JSON.stringify(filteredValues, null, 2));
        setOpen(true);
    }

    useEffect(() => {
        if (date?.from) {
            form.setValue("TimeStart", date.from.toISOString());
        } else {
            form.setValue("TimeStart", '');
        }
        if (date?.to) {
            form.setValue("TimeEnd", date.to.toISOString());
        } else {
            form.setValue("TimeEnd", '');
        }
        
        logger.debug(`Date range: ${JSON.stringify(date)}`);
    }, [date, form]);
    
    function setQuery() {
        const params = new URLSearchParams();
        
        logger.debug(`URLSearchParams: ${JSON.stringify(params)}`);
        // Filter out empty values
        const filteredValues = Object.fromEntries(
            Object.entries(form.getValues()).filter(([_, value]) => value !== '')
        );
        
        // logger.debug(`Filtered values: ${JSON.stringify(filteredValues)}`);
        
        Object.entries(filteredValues).forEach(([key, value]) => {
            params.append(key, value);
        });
        
        // logger.debug(`URLSearchParams: ${JSON.stringify(params)}`);
        
        router.push(`?${params.toString()}`);
    }

    // Update form values based on JSON input
    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const jsonValue = e.target.value;
        try {
            // logger.debug(`URLSearchParams: ${JSON.stringify(jsonValue)}`);
            const parsedJson = JSON.parse(jsonValue);
            
            // logger.debug(`Parsed JSON: ${JSON.stringify(parsedJson)}`);
            // Dynamically update the form values with the parsed JSON
            Object.entries(parsedJson).forEach(([key, value]) => {
                if (form.setValue) {
                    form.setValue(key as keyof z.infer<typeof formSchema>, value);
                }
            });
            
            // logger.debug(`Form values: ${JSON.stringify(form.getValues())}`);
        } catch (err) {
            // If invalid JSON, do nothing (or show a warning if desired)
            // logger.logWithErrorHandling('Error in JSON parsing:', err);
            throw err;
        }
    };

    // Generate the JSON representation of the form values
    const generateJson = () => {
        // logger.debug(`generateJson: ${JSON.stringify(form.getValues())}`);
        return JSON.stringify(
            Object.fromEntries(
                Object.entries(form.watch()).filter(([_, value]) => value !== '')
            ),
            null,
            2
        );
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Object.keys(formSchema.shape).map((field) => (
                    field !== "TimeStart" && field !== "TimeEnd" && (
                        <FormField
                            key={field}
                            control={form.control}
                            name={field as keyof z.infer<typeof formSchema>}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{field.name}</FormLabel>
                                    <FormControl>
                                        {/* if field is IntervaleQuery only allow number*/}
                                        {field.name === "IntervaleQuery" ? (
                                            <Input {...field} type="number" onChange={(e) => field.onChange(Number(e.target.value))} />
                                        ) : (
                                            <Input {...field} />
                                        )}
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )
                ))}
                <div className="col-span-full">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon />
                                {date?.from ? (
                                    date.to ? (
                                        `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`
                                    ) : (
                                        format(date.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Pick a date range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="col-span-full">
                    <Textarea
                        ref={textareaRef}
                        value={generateJson()}  // Show the JSON representation of form values
                        onChange={handleTextareaChange} // Update form values when JSON is modified
                        className="overflow-hidden resize-none w-full"
                        placeholder="Paste JSON here"
                    />
                </div>
                <div className="col-span-full flex gap-4 w-full">
                    <Button type="submit" className="w-full">Submit</Button>
                </div>
            </form>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogTrigger asChild>
                    <Button className="hidden">Open</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Copied</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your JSON has been copied to the clipboard successfully. Don't forget to paste it somewhere!
                            <br/>
                            Do you want to test the API with this query?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => setQuery()}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Form>
    );
};

export default QueryForm;
