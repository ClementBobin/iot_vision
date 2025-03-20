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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { useRouter } from "next/navigation";
import { ClientLogger } from '@/lib/api.client';

// Define the schema for form validation using zod
const formSchema = z.object({
    NameQuery: z.string().min(1, "est requis"), // Required string
    DescriptionQuery: z.string().min(1, "est requis"), // Required string
    IntervaleQueryMinutes: z.number().optional(), // Optional number
    IdSite: z.string().uuid().or(z.literal('')).optional(), // Optional UUID or empty string
    SiteName: z.string().optional(), // Optional string
    CapteurName: z.string().optional(), // Optional string
    CapteurTypeName: z.string().optional(), // Optional string
    Module: z.string().optional(), // Optional string
    Type: z.string().optional(), // Optional string
    Model: z.string().optional(), // Optional string
    LastTimePeriod: z.string().regex(/^\d+[dmy]$/, "doit être au format 30d, 8m, ou 4y").optional(), // Optional string with specific format
    TimeStart: z.string().datetime().or(z.literal('')).optional(), // Optional datetime string or empty string
    TimeEnd: z.string().datetime().or(z.literal('')).optional() // Optional datetime string or empty string
});

// Define labels for form fields
const fieldLabels: { [key: string]: string } = {
    NameQuery: 'Nom de la requête',
    DescriptionQuery: 'Description de la requête',
    IntervaleQueryMinutes: 'Intervale de la requête (minutes)',
    IdSite: 'ID du site',
    SiteName: 'Nom du site',
    CapteurName: 'Nom du capteur',
    CapteurTypeName: 'Type de capteur',
    Module: 'Module',
    Type: 'Type',
    Model: 'Modèle',
    LastTimePeriod: 'Dernière période (ex: 30d; 8m; 4y)',
    TimeStart: 'Date de début',
    TimeEnd: 'Date de fin'
};

const QueryForm = () => {
    // Initialize the form with default values and validation schema
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            NameQuery: '',
            DescriptionQuery: '',
            IntervaleQueryMinutes: '',
            IdSite: '',
            SiteName: '',
            CapteurName: '',
            CapteurTypeName: '',
            Module: '',
            Type: '',
            Model: '',
            TimeStart: '',
            TimeEnd: '',
            LastTimePeriod: '',
        }
    });

    const textareaRef = useRef<HTMLTextAreaElement>(null); // Reference for the textarea
    const [date, setDate] = useState<DateRange | undefined>(undefined); // State for date range
    const [open, setOpen] = useState(false); // State for alert dialog
    const router = useRouter(); // Next.js router for navigation

    // Log form errors to the client logger
    useEffect(() => {
        ClientLogger.logWithErrorHandling('Error in query form:', form.formState.errors);
    }, [form.formState.errors]);

    // Adjust textarea height based on content
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [form.watch()]);

    // Handle form submission
    function onSubmit(values: z.infer<typeof formSchema>) {
        // Filter out empty values
        const filteredValues = Object.fromEntries(
            Object.entries(values).filter(([_, value]) => value !== '')
        );

        // Copy JSON to clipboard
        navigator.clipboard.writeText(JSON.stringify(filteredValues, null, 2));
        setOpen(true); // Open the alert dialog
    }

    // Update form values based on date range selection
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

    }, [date, form]);

    // Set query parameters and navigate to the new URL
    function setQuery() {
        const params = new URLSearchParams();

        // Filter out empty values
        const filteredValues = Object.fromEntries(
            Object.entries(form.getValues()).filter(([_, value]) => value !== '')
        );

        Object.entries(filteredValues).forEach(([key, value]) => {
            params.append(key, value);
        });

        router.push(`?${params.toString()}`);
    }

    // Generate the JSON representation of the form values
    const generateJson = () => {
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
                    field !== "TimeStart" && field !== "TimeEnd" && field !== "LastTimePeriod" && (
                        <FormField
                            key={field}
                            control={form.control}
                            name={field as keyof z.infer<typeof formSchema>}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{fieldLabels[field.name]}</FormLabel>
                                    <FormControl>
                                        {/* if field is IntervaleQuery only allow number*/}
                                        {field.name === "IntervaleQueryMinutes" ? (
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
                <Tabs defaultValue="date" className="col-span-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="date">Date</TabsTrigger>
                        <TabsTrigger value="period">Période</TabsTrigger>
                    </TabsList>
                    <TabsContent value="date">
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
                                        <span>Sélectionnez une plage de dates</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    selected={date}
                                    onSelect={(selectedDate) => {
                                        setDate(selectedDate);
                                        if (selectedDate?.from || selectedDate?.to) {
                                            form.setValue("LastTimePeriod", '');
                                        }
                                    }}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </TabsContent>
                    <TabsContent value="period">
                        <FormField
                            control={form.control}
                            name="LastTimePeriod"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{fieldLabels[field.name]}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="text"
                                            onChange={(e) => {
                                                field.onChange(e);
                                                if (e.target.value) {
                                                    setDate(undefined);
                                                }
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </TabsContent>
                </Tabs>
                <div className="col-span-full">
                    <Textarea
                        ref={textareaRef}
                        value={generateJson()}  // Show the JSON representation of form values
                        readOnly={true}
                        className="overflow-hidden resize-none w-full"
                        placeholder="Paste JSON here"
                    />
                </div>
                <div className="col-span-full flex gap-4 w-full">
                    <Button type="submit" className="w-full">Soumettre</Button>
                </div>
            </form>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogTrigger asChild>
                    <Button className="hidden">Ouvrir</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Copié</AlertDialogTitle>
                        <AlertDialogDescription>
                            Votre JSON a été copié dans le presse-papiers avec succès. N'oubliez pas de le coller quelque part !
                            <br />
                            Voulez-vous tester l'API avec cette requête ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => setQuery()}>Continuer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Form>
    );
};

export default QueryForm;
